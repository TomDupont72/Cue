import {
  createEmptyPrismaMockData,
  mockPrisma,
  ONE_PIECE_TMDB_ID,
  onePiecePrismaData
} from "@/test/mocks/prisma.mock.js";
import { mockTmdbFetch } from "@/test/mocks/tmdb.mock.js";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from "fastify-type-provider-zod";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seriesRoutes } from "../series.routes.js";

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

  await app.register(seriesRoutes, { prefix: "/api/series" });
  await app.ready();

  return app;
}

describe("POST /api/series/import", () => {
  it("returns an existing series without accessing the real database", async (t) => {
    const prismaMock = mockPrisma(t);
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "POST",
      url: "/api/series/import",
      payload: { tmdbId: ONE_PIECE_TMDB_ID }
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().tmdbId, ONE_PIECE_TMDB_ID);
    assert.equal(response.json().name, "One Piece");
    assert.equal(onePiecePrismaData.seasons.length, 2);
    assert.equal(onePiecePrismaData.episodes.length, 4);
    assert.equal(prismaMock.series.findUnique.mock.callCount(), 1);
    assert.deepEqual(prismaMock.series.findUnique.mock.calls[0]?.arguments, [
      { where: { tmdbId: ONE_PIECE_TMDB_ID } }
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
    assert.equal(response.json().name, "One Piece");
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
