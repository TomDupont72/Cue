import type { Series, UserEpisode, UserSeries } from "@/generated/prisma/client.js";
import { userService } from "@/modules/user/user.service.js";
import type { EpisodeFeedRow } from "@/modules/user/user.types.js";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from "fastify-type-provider-zod";
import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { userRoutes } from "../user.routes.js";

const USER_ID = "test-user";
const SERIES_ID = 1;
const EPISODE_ID = 101;
const SEASON_ID = 10;
const NOW = new Date("2026-08-08T15:30:00.000Z");
const CREATED_AT = new Date("2026-01-01T00:00:00.000Z");
const UPDATED_AT = new Date("2026-01-02T00:00:00.000Z");

const series: Series = {
  id: SERIES_ID,
  adult: false,
  backdropPath: null,
  firstAirDate: CREATED_AT,
  tmdbId: 100,
  inProduction: true,
  lastAirDate: NOW,
  name: "Test series",
  numberOfEpisodes: 12,
  numberOfSeasons: 1,
  originalLanguage: "fr",
  originalName: "Test series",
  overview: null,
  popularity: 1,
  posterPath: null,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT
};

const userSeries: UserSeries = {
  userId: USER_ID,
  seriesId: SERIES_ID,
  status: "WATCHING",
  isFavorite: false,
  watchCount: 1,
  watchedEpisodeCount: 1,
  addedAt: CREATED_AT,
  lastWatchedAt: NOW
};

const userEpisode: UserEpisode = {
  userId: USER_ID,
  episodeId: EPISODE_ID,
  watchedAt: NOW
};

const feedItem: EpisodeFeedRow = {
  userId: USER_ID,
  seriesId: SERIES_ID,
  status: "WATCHING",
  lastWatchedAt: NOW,
  seriesName: series.name,
  seriesPosterPath: series.posterPath,
  seriesTmdbId: series.tmdbId,
  id: EPISODE_ID + 1,
  name: "Next episode",
  seasonNumber: 1,
  episodeNumber: 2,
  airDate: CREATED_AT,
  stillPath: null,
  runtime: 25,
  overview: null,
  remainingEpisodes: 11
};

async function buildApp() {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("requireAuth", async (request) => {
    request.user = { id: USER_ID };
  });
  app.decorate("requireWorker", async (request) => {
    request.worker = { isWorker: true };
  });

  await app.register(userRoutes, { prefix: "/api/user" });
  await app.ready();

  return app;
}

function mockSuccessfulResponses(t: TestContext) {
  t.mock.method(userService, "seriesGet", async () => ({
    items: [{ ...userSeries, seriesDetails: series }],
    hasNextPage: true,
    nextCursor: NOW
  }));
  t.mock.method(userService, "dashboardSummaryGet", async () => ({
    totalWatchedMinutes: 25,
    totalWatchedEpisodes: 1,
    totalWatchedSeries: 0
  }));
  t.mock.method(userService, "seriesPost", async () => userSeries);
  t.mock.method(userService, "episodeFeedGet", async () => ({
    WATCHING: [feedItem],
    PAUSED: [],
    DROPPED: []
  }));
  t.mock.method(userService, "episodePost", async () => ({
    ...userEpisode,
    seriesId: SERIES_ID,
    nextEpisode: feedItem
  }));
  t.mock.method(userService, "episodeDelete", async () => userEpisode);
  t.mock.method(userService, "seasonPost", async () => [userEpisode]);
  t.mock.method(userService, "seasonDelete", async () => [userEpisode]);
  t.mock.method(userService, "seriesReconcilePost", async () => ({ updatedCount: 1 }));
}

describe("user route response contracts", { concurrency: false }, () => {
  it("serializes every successful route with its declared shape", async (t) => {
    mockSuccessfulResponses(t);
    const app = await buildApp();
    t.after(() => app.close());

    const cases = [
      {
        method: "GET",
        url: "/api/user/series?limit=1",
        expected: {
          items: [
            {
              ...userSeries,
              seriesDetails: series
            }
          ],
          hasNextPage: true,
          nextCursor: NOW
        }
      },
      {
        method: "GET",
        url: "/api/user/dashboard/summary",
        expected: {
          totalWatchedMinutes: 25,
          totalWatchedEpisodes: 1,
          totalWatchedSeries: 0
        }
      },
      {
        method: "POST",
        url: `/api/user/series/${SERIES_ID}`,
        payload: { status: "WATCHING" },
        expected: userSeries
      },
      {
        method: "GET",
        url: "/api/user/episodes/feed",
        expected: { WATCHING: [feedItem], PAUSED: [], DROPPED: [] }
      },
      {
        method: "POST",
        url: `/api/user/series/${SERIES_ID}/episode/${EPISODE_ID}`,
        expected: { ...userEpisode, seriesId: SERIES_ID, nextEpisode: feedItem }
      },
      {
        method: "DELETE",
        url: `/api/user/series/${SERIES_ID}/episode/${EPISODE_ID}`,
        expected: userEpisode
      },
      {
        method: "POST",
        url: `/api/user/series/${SERIES_ID}/season/${SEASON_ID}`,
        expected: [userEpisode]
      },
      {
        method: "DELETE",
        url: `/api/user/series/${SERIES_ID}/season/${SEASON_ID}`,
        expected: [userEpisode]
      },
      {
        method: "POST",
        url: `/api/user/${USER_ID}/series/reconcile`,
        expected: { updatedCount: 1 }
      }
    ] as const;

    for (const { method, url, expected, ...options } of cases) {
      const response = await app.inject({ method, url, ...options });

      assert.equal(response.statusCode, 200, response.body);
      assert.deepEqual(response.json(), JSON.parse(JSON.stringify(expected)));
    }
  });

  it("rejects a response that violates a user route contract", async (t) => {
    t.mock.method(userService, "episodeDelete", async () => [userEpisode] as never);
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "DELETE",
      url: `/api/user/series/${SERIES_ID}/episode/${EPISODE_ID}`
    });

    assert.equal(response.statusCode, 500);
  });
});
