import {
  createEmptyPrismaMockData,
  mockPrisma,
  ONE_PIECE_TMDB_ID,
  onePiecePrismaData
} from "@/test/mocks/prisma.mock.js";
import {
  mockTmdbFetch,
  onePieceTmdbDetailsResponse,
  onePieceTmdbSeasonResponses
} from "@/test/mocks/tmdb.mock.js";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from "fastify-type-provider-zod";
import fastifyAuth from "@fastify/auth";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seriesRoutes } from "../series.routes.js";
import { env } from "@/shared/config/env.js";
import { workerGuard } from "@/shared/middlewares/require-worker.js";
import type { TestContext } from "node:test";

const WORKER_TOKEN = "worker-token-used-by-series-route-tests";

function enableWorkerToken(t: TestContext) {
  const previousWorkerToken = env.WORKER_TOKEN;
  env.WORKER_TOKEN = WORKER_TOKEN;
  t.after(() => {
    env.WORKER_TOKEN = previousWorkerToken;
  });
}

async function buildApp(authenticated = true) {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("requireAuth", async (request) => {
    if (!authenticated) {
      const error = new Error("You must be logged in") as Error & { statusCode: number };
      error.statusCode = 401;
      throw error;
    }

    request.user = { id: "test-user" };
  });

  await app.register(fastifyAuth);
  await app.register(workerGuard);
  await app.register(seriesRoutes, { prefix: "/api/series" });
  await app.ready();

  return app;
}

describe("GET /api/series/:id", () => {
  it("returns the catalogue records and serializes their dates", async (t) => {
    mockPrisma(t);
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "GET",
      url: "/api/series/1"
    });

    assert.equal(response.statusCode, 200, response.body);
    const body = response.json();
    assert.equal(body.series.tmdbId, ONE_PIECE_TMDB_ID);
    assert.equal(body.series.firstAirDate, "1999-10-20T00:00:00.000Z");
    assert.equal(body.series.createdAt, "2026-01-01T00:00:00.000Z");
    assert.equal(body.seasons.length, 2);
    assert.equal(body.seasons[0].airDate, "1999-10-20T00:00:00.000Z");
    assert.equal(body.episodes.length, 4);
    assert.equal(body.episodes[0].airDate, "1999-10-20T00:00:00.000Z");
    assert.equal(body.userSeries, null);
    assert.deepEqual(body.userEpisodes, [
      {
        userId: "test-user",
        episodeId: 100,
        watchedAt: "2026-01-01T00:00:00.000Z"
      }
    ]);
  });
});

describe("POST /api/series/import", () => {
  it("returns an existing series to a user without calling TMDB", async (t) => {
    const prismaMock = mockPrisma(t);
    const fetchMock = t.mock.method(globalThis, "fetch");
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "POST",
      url: "/api/series/import",
      payload: { tmdbId: ONE_PIECE_TMDB_ID }
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().series.tmdbId, ONE_PIECE_TMDB_ID);
    assert.equal(response.json().series.name, "One Piece");
    assert.equal(response.json().userSeries, null);
    assert.equal(onePiecePrismaData.seasons.length, 2);
    assert.equal(onePiecePrismaData.episodes.length, 4);
    assert.equal(prismaMock.series.upsert.mock.callCount(), 0);
    assert.equal(fetchMock.mock.callCount(), 0);
    assert.equal(prismaMock.transaction.mock.callCount(), 0);
    assert.deepEqual(prismaMock.userSeries.findUnique.mock.calls[0]?.arguments, [
      {
        where: {
          userId_seriesId: { userId: "test-user", seriesId: onePiecePrismaData.series[0]!.id }
        }
      }
    ]);
  });

  it("imports every One Piece entity and relation when the database is empty", async (t) => {
    const data = createEmptyPrismaMockData();
    const prismaMock = mockPrisma(t, data);
    const fetchMock = mockTmdbFetch(t);
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "POST",
      url: "/api/series/import",
      payload: { tmdbId: ONE_PIECE_TMDB_ID }
    });

    assert.equal(response.statusCode, 200, response.body);
    assert.equal(response.json().series.name, "One Piece");
    assert.equal(response.json().userSeries, null);
    assert.equal(data.series.length, 1);
    assert.equal(data.seasons.length, 2);
    assert.equal(data.episodes.length, 4);
    assert.equal(data.genres.length, 2);
    assert.equal(data.networks.length, 1);
    assert.equal(data.people.length, 3);
    assert.equal(data.characters.length, 1);
    assert.equal(data.seriesGenres.length, 2);
    assert.equal(data.seriesNetworks.length, 1);
    assert.equal(data.seriesPeople.length, 1);
    assert.equal(data.episodePeople.length, 4);
    assert.equal(data.episodeCharacters.length, 4);

    const seriesId = data.series[0]?.id;
    const seasonIds = new Set(data.seasons.map((season) => season.id));
    const episodeIds = new Set(data.episodes.map((episode) => episode.id));
    const peopleIds = new Set(data.people.map((person) => person.id));
    const characterIds = new Set(data.characters.map((character) => character.id));

    assert.ok(data.seasons.every((season) => season.seriesId === seriesId));
    assert.ok(
      data.episodes.every(
        (episode) => episode.seriesId === seriesId && seasonIds.has(episode.seasonId)
      )
    );
    assert.ok(data.characters.every((character) => peopleIds.has(character.peopleId)));
    assert.ok(
      data.episodePeople.every(
        (relation) => episodeIds.has(relation.episodeId) && peopleIds.has(relation.peopleId)
      )
    );
    assert.ok(
      data.episodeCharacters.every(
        (relation) => episodeIds.has(relation.episodeId) && characterIds.has(relation.characterId)
      )
    );
    assert.equal("createdBy" in data.series[0], false);
    assert.equal("episodes" in data.seasons[0], false);
    assert.equal("guestStars" in data.episodes[0], false);
    assert.equal("character" in data.people[0], false);
    assert.equal(fetchMock.mock.callCount(), 3);
    assert.equal(prismaMock.transaction.mock.callCount(), 1);

    const secondResponse = await app.inject({
      method: "POST",
      url: "/api/series/import",
      payload: { tmdbId: ONE_PIECE_TMDB_ID }
    });

    assert.equal(secondResponse.statusCode, 200);
    assert.equal(data.series.length, 1);
    assert.equal(data.episodes.length, 4);
    assert.equal(fetchMock.mock.callCount(), 3);
    assert.equal(data.genres.length, 2);
    assert.equal(data.networks.length, 1);
    assert.equal(data.people.length, 3);
    assert.equal(data.characters.length, 1);
    assert.equal(data.seriesGenres.length, 2);
    assert.equal(data.seriesNetworks.length, 1);
    assert.equal(data.seriesPeople.length, 1);
    assert.equal(data.episodePeople.length, 4);
    assert.equal(data.episodeCharacters.length, 4);
  });

  it("updates catalogue data in place and adds new episodes", async (t) => {
    enableWorkerToken(t);
    const data = structuredClone(onePiecePrismaData);
    data.series[0]!.name = "Ancien titre";
    data.seasons[0]!.name = "Ancienne saison";
    data.episodes[0]!.name = "Ancien épisode";
    const seriesId = data.series[0]!.id;
    const seasonId = data.seasons[0]!.id;
    const episodeId = data.episodes[0]!.id;
    const seasons = structuredClone(onePieceTmdbSeasonResponses);
    seasons[1].episodes.push({
      ...seasons[1].episodes[1],
      id: 20005,
      episode_number: 3,
      name: "Un nouvel épisode"
    });
    const prismaMock = mockPrisma(t, data);
    mockTmdbFetch(t, { seasons });
    const app = await buildApp(false);
    t.after(() => app.close());

    const response = await app.inject({
      method: "POST",
      url: "/api/series/import",
      headers: { authorization: `Bearer ${WORKER_TOKEN}` },
      payload: { tmdbId: ONE_PIECE_TMDB_ID }
    });

    assert.equal(response.statusCode, 200, response.body);
    assert.equal(data.series[0]!.id, seriesId);
    assert.equal(data.series[0]!.name, "One Piece");
    assert.equal(data.seasons[0]!.id, seasonId);
    assert.equal(data.seasons[0]!.name, "East Blue");
    assert.equal(data.episodes[0]!.id, episodeId);
    assert.equal(data.episodes[0]!.name, "Je suis Luffy !");
    assert.deepEqual(data.userEpisodes, [
      { userId: "test-user", episodeId, watchedAt: new Date("2026-01-01T00:00:00.000Z") }
    ]);
    assert.equal(data.episodes.length, 5);
    assert.equal(
      data.episodes.find((episode) => episode.tmdbId === 20005)?.name,
      "Un nouvel épisode"
    );
    assert.equal(prismaMock.series.upsert.mock.callCount(), 1);

    const secondResponse = await app.inject({
      method: "POST",
      url: "/api/series/import",
      headers: { authorization: `Bearer ${WORKER_TOKEN}` },
      payload: { tmdbId: ONE_PIECE_TMDB_ID }
    });

    assert.equal(secondResponse.statusCode, 200, secondResponse.body);
    assert.equal(data.episodes.length, 5);
    assert.equal(data.episodePeople.length, 5);
    assert.equal(data.episodeCharacters.length, 5);
  });

  it("removes stale TMDB relations without deleting catalogue entities", async (t) => {
    enableWorkerToken(t);
    const data = structuredClone(onePiecePrismaData);
    const details = {
      ...structuredClone(onePieceTmdbDetailsResponse),
      created_by: [],
      genres: [onePieceTmdbDetailsResponse.genres[0]],
      networks: []
    };
    const seasons = structuredClone(onePieceTmdbSeasonResponses);
    for (const season of Object.values(seasons)) {
      for (const episode of season.episodes) {
        episode.crew = [];
        episode.guest_stars = [];
      }
    }
    mockPrisma(t, data);
    mockTmdbFetch(t, { details, seasons });
    const app = await buildApp(false);
    t.after(() => app.close());

    const response = await app.inject({
      method: "POST",
      url: "/api/series/import",
      headers: { authorization: `Bearer ${WORKER_TOKEN}` },
      payload: { tmdbId: ONE_PIECE_TMDB_ID }
    });

    assert.equal(response.statusCode, 200, response.body);
    assert.equal(data.seriesGenres.length, 1);
    assert.equal(data.seriesNetworks.length, 0);
    assert.equal(data.seriesPeople.length, 0);
    assert.equal(data.episodePeople.length, 0);
    assert.equal(data.episodeCharacters.length, 0);
    assert.equal(data.seasons.length, 2);
    assert.equal(data.episodes.length, 4);
  });

  it("treats an invalid worker token and a force field as a normal user request", async (t) => {
    enableWorkerToken(t);
    const prismaMock = mockPrisma(t);
    const fetchMock = t.mock.method(globalThis, "fetch");
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "POST",
      url: "/api/series/import",
      headers: { authorization: "Bearer invalid-worker-token" },
      payload: { tmdbId: ONE_PIECE_TMDB_ID, force: true }
    });

    assert.equal(response.statusCode, 200, response.body);
    assert.equal(fetchMock.mock.callCount(), 0);
    assert.equal(prismaMock.series.upsert.mock.callCount(), 0);
  });

  it("rejects an invalid TMDB identifier before calling Prisma", async (t) => {
    const prismaMock = mockPrisma(t, createEmptyPrismaMockData());
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "POST",
      url: "/api/series/import",
      payload: { tmdbId: 0 }
    });

    assert.equal(response.statusCode, 400);
    assert.equal(prismaMock.series.findUnique.mock.callCount(), 0);
  });

  it("rejects unauthenticated requests before calling Prisma", async (t) => {
    const prismaMock = mockPrisma(t, createEmptyPrismaMockData());
    const app = await buildApp(false);
    t.after(() => app.close());

    const response = await app.inject({
      method: "POST",
      url: "/api/series/import",
      payload: { tmdbId: ONE_PIECE_TMDB_ID }
    });

    assert.equal(response.statusCode, 401);
    assert.equal(prismaMock.series.findUnique.mock.callCount(), 0);
  });
});
