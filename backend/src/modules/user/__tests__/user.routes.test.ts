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
import { encodeUserSeriesCursor } from "../user.pagination.js";
import { userRoutes } from "../user.routes.js";
import { env } from "@/shared/config/env.js";
import { workerGuard } from "@/shared/middlewares/require-worker.js";

const USER_ID = "test-user";
const SERIES_ID = 1;
const EPISODE_ID = 101;
const SEASON_ID = 10;
const NOW = new Date("2026-08-08T15:30:00.000Z");
const CREATED_AT = new Date("2026-01-01T00:00:00.000Z");
const UPDATED_AT = new Date("2026-01-02T00:00:00.000Z");
const WORKER_TOKEN = "worker-token-used-by-user-route-tests";
const USER_SERIES_CURSOR = encodeUserSeriesCursor({
  lastWatchedAt: NOW,
  seriesId: SERIES_ID
});

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

function enableWorkerToken(t: TestContext) {
  const previousWorkerToken = env.WORKER_TOKEN;
  env.WORKER_TOKEN = WORKER_TOKEN;
  t.after(() => {
    env.WORKER_TOKEN = previousWorkerToken;
  });
}

async function buildApp() {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("requireAuth", async (request) => {
    request.user = { id: USER_ID };
  });

  await app.register(workerGuard);
  await app.register(userRoutes, { prefix: "/api/user" });
  await app.ready();

  return app;
}

function mockSuccessfulResponses(t: TestContext) {
  t.mock.method(userService, "userSeriesGet", async () => ({
    items: [{ ...userSeries, seriesDetails: series }],
    hasNextPage: true,
    nextCursor: USER_SERIES_CURSOR
  }));
  t.mock.method(userService, "userDashboardSummaryGet", async () => ({
    totalWatchedMinutes: 25,
    totalWatchedEpisodes: 1,
    totalWatchedSeries: 0
  }));
  t.mock.method(userService, "userSeriesPost", async () => userSeries);
  t.mock.method(userService, "userEpisodeFeedGet", async () => ({
    watching: [feedItem],
    paused: [],
    dropped: []
  }));
  t.mock.method(userService, "userEpisodePost", async () => ({
    ...userEpisode,
    seriesId: SERIES_ID,
    nextEpisode: feedItem
  }));
  t.mock.method(userService, "userEpisodeDelete", async () => userEpisode);
  t.mock.method(userService, "userSeasonPost", async () => [userEpisode]);
  t.mock.method(userService, "userSeasonDelete", async () => [userEpisode]);
  t.mock.method(userService, "userStatusRecalculatePost", async () => ({ updatedCount: 1 }));
}

describe("user route response contracts", { concurrency: false }, () => {
  it("serializes every successful route with its declared shape", async (t) => {
    enableWorkerToken(t);
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
          nextCursor: USER_SERIES_CURSOR
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
        expected: { watching: [feedItem], paused: [], dropped: [] }
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
        url: `/api/user/status/${USER_ID}/recalculate`,
        headers: { authorization: `Bearer ${WORKER_TOKEN}` },
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
    t.mock.method(userService, "userEpisodeDelete", async () => [userEpisode] as never);
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "DELETE",
      url: `/api/user/series/${SERIES_ID}/episode/${EPISODE_ID}`
    });

    assert.equal(response.statusCode, 500);
  });

  it("accepts and forwards an opaque pagination cursor", async (t) => {
    const userSeriesGet = t.mock.method(userService, "userSeriesGet", async () => ({
      items: [],
      hasNextPage: false,
      nextCursor: null
    }));
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "GET",
      url: `/api/user/series?cursor=${encodeURIComponent(USER_SERIES_CURSOR)}`
    });

    assert.equal(response.statusCode, 200, response.body);
    assert.deepEqual(userSeriesGet.mock.calls[0]?.arguments, [
      USER_ID,
      {
        limit: 20,
        cursor: USER_SERIES_CURSOR
      }
    ]);
  });

  it("rejects a malformed pagination cursor before calling the service", async (t) => {
    const userSeriesGet = t.mock.method(userService, "userSeriesGet", async () => ({
      items: [],
      hasNextPage: false,
      nextCursor: null
    }));
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "GET",
      url: "/api/user/series?cursor=not-a-cursor"
    });

    assert.equal(response.statusCode, 400, response.body);
    assert.equal(userSeriesGet.mock.callCount(), 0);
  });
});

describe("POST /api/user/status/:userId/recalculate", { concurrency: false }, () => {
  it("rejects a request without a worker token before calling the service", async (t) => {
    enableWorkerToken(t);
    const recalculate = t.mock.method(userService, "userStatusRecalculatePost", async () => ({
      updatedCount: 1
    }));
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "POST",
      url: `/api/user/status/${USER_ID}/recalculate`
    });

    assert.equal(response.statusCode, 401, response.body);
    assert.equal(recalculate.mock.callCount(), 0);
  });

  it("rejects an invalid worker token before calling the service", async (t) => {
    enableWorkerToken(t);
    const recalculate = t.mock.method(userService, "userStatusRecalculatePost", async () => ({
      updatedCount: 1
    }));
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "POST",
      url: `/api/user/status/${USER_ID}/recalculate`,
      headers: { authorization: "Bearer invalid-worker-token" }
    });

    assert.equal(response.statusCode, 401, response.body);
    assert.equal(recalculate.mock.callCount(), 0);
  });

  it("accepts a valid worker token and forwards the user identifier", async (t) => {
    enableWorkerToken(t);
    const recalculate = t.mock.method(userService, "userStatusRecalculatePost", async () => ({
      updatedCount: 1
    }));
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "POST",
      url: `/api/user/status/${USER_ID}/recalculate`,
      headers: { authorization: `Bearer ${WORKER_TOKEN}` }
    });

    assert.equal(response.statusCode, 200, response.body);
    assert.deepEqual(response.json(), { updatedCount: 1 });
    assert.deepEqual(recalculate.mock.calls[0]?.arguments, [{ userId: USER_ID }]);
  });
});
