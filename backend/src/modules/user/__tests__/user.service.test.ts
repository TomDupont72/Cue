import type { Episode, Series, UserEpisode, UserSeries } from "@/generated/prisma/client.js";
import { episodeRepository } from "@/modules/episode/episode.repository.js";
import { seriesRepository } from "@/modules/series/series.repository.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { userRepository } from "../user.repository.js";
import { userService } from "../user.service.js";

const USER_ID = "test-user";
const SERIES_ID = 1;
const SEASON_ID = 10;
const NOW = new Date("2026-08-08T15:30:00.000Z");
const NEXT_UTC_DAY = new Date("2026-08-09T00:00:00.000Z");
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

function makeEpisode(id: number, seasonNumber = 1): Episode {
  return {
    id,
    seriesId: SERIES_ID,
    seasonId: SEASON_ID,
    airDate: NOW,
    episodeNumber: id,
    name: `Episode ${id}`,
    overview: null,
    tmdbId: 1_000 + id,
    stillPath: null,
    runtime: 25,
    seasonNumber,
    voteAverage: 8,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT
  };
}

function makeUserSeries(overrides: Partial<UserSeries> = {}): UserSeries {
  return {
    userId: USER_ID,
    seriesId: SERIES_ID,
    status: "WATCHING",
    isFavorite: false,
    watchCount: 1,
    addedAt: CREATED_AT,
    lastWatchedAt: NOW,
    ...overrides
  };
}

function makeUserEpisode(episodeId: number): UserEpisode {
  return { userId: USER_ID, episodeId, watchedAt: NOW };
}

function mockTransaction(t: TestContext) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(prisma, "$transaction");
  const transaction = t.mock.fn(async <TResult>(callback: (tx: PrismaTx) => Promise<TResult>) =>
    callback(prisma)
  );

  Object.defineProperty(prisma, "$transaction", {
    ...originalDescriptor,
    value: transaction
  });
  t.after(() => {
    if (originalDescriptor) {
      Object.defineProperty(prisma, "$transaction", originalDescriptor);
    }
  });

  return transaction;
}

describe("userService", { concurrency: false }, () => {
  it("combines the user, series and status filters when listing UserSeries", async (t) => {
    const expectedUserSeries = makeUserSeries({ status: "PLANNED" });
    const findManySeries = t.mock.method(userRepository, "findManySeries", async () => ({
      items: [expectedUserSeries],
      hasNextPage: false,
      nextCursor: null
    }));
    const findManySeriesDetails = t.mock.method(seriesRepository, "findMany", async () => [series]);

    const result = await userService.userSeriesGet(USER_ID, {
      seriesId: SERIES_ID,
      status: "PLANNED",
      limit: 20
    });

    assert.deepEqual(findManySeries.mock.calls[0]?.arguments, [
      { userId: USER_ID, seriesId: SERIES_ID, status: "PLANNED" },
      20,
      undefined
    ]);
    assert.deepEqual(findManySeriesDetails.mock.calls[0]?.arguments, [{ id: { in: [SERIES_ID] } }]);
    assert.deepEqual(result, {
      items: [{ ...expectedUserSeries, seriesDetails: series }],
      hasNextPage: false,
      nextCursor: null
    });
  });

  it("passes the body to both branches of the UserSeries upsert", async (t) => {
    const body = { status: "PAUSED" as const, isFavorite: true };
    const expected = makeUserSeries(body);
    const upsertSeries = t.mock.method(userRepository, "upsertSeries", async () => expected);

    const result = await userService.userSeriesPost(USER_ID, { seriesId: SERIES_ID }, body);

    assert.equal(result, expected);
    assert.deepEqual(upsertSeries.mock.calls[0]?.arguments, [
      { userId_seriesId: { userId: USER_ID, seriesId: SERIES_ID } },
      { userId: USER_ID, seriesId: SERIES_ID, ...body },
      body
    ]);
  });

  it("updates only the supplied UserSeries field", async (t) => {
    const body = { isFavorite: true };
    const expected = makeUserSeries(body);
    const upsertSeries = t.mock.method(userRepository, "upsertSeries", async () => expected);

    await userService.userSeriesPost(USER_ID, { seriesId: SERIES_ID }, body);

    assert.deepEqual(upsertSeries.mock.calls[0]?.arguments, [
      { userId_seriesId: { userId: USER_ID, seriesId: SERIES_ID } },
      { userId: USER_ID, seriesId: SERIES_ID, isFavorite: true },
      { isFavorite: true }
    ]);
  });

  it("creates a released episode after ensuring the UserSeries and increments atomically", async (t) => {
    mockTransaction(t);
    const events: string[] = [];
    const episode = makeEpisode(101);
    const createdUserEpisode = makeUserEpisode(episode.id);
    const findEpisode = t.mock.method(episodeRepository, "findOne", async () => episode);
    t.mock.method(seriesRepository, "findOne", async () => series);
    t.mock.method(userRepository, "ensureSeries", async () => {
      events.push("ensureSeries");
      return { count: 1 };
    });
    t.mock.method(userRepository, "createManyEpisodes", async () => {
      events.push("createManyEpisodes");
      return [createdUserEpisode];
    });
    const incrementSeriesProgress = t.mock.method(
      userRepository,
      "incrementSeriesProgress",
      async () => makeUserSeries({ watchCount: 1 })
    );
    t.mock.method(userRepository, "updateSeries", async () => makeUserSeries({ watchCount: 1 }));
    t.mock.method(userRepository, "getEpisodeFeedItem", async () => null);

    const result = await userService.userEpisodePost(
      USER_ID,
      { seriesId: SERIES_ID, episodeId: episode.id },
      NOW
    );

    assert.deepEqual(findEpisode.mock.calls[0]?.arguments[0], {
      id: episode.id,
      seriesId: SERIES_ID,
      airDate: { lt: NEXT_UTC_DAY }
    });
    assert.deepEqual(events, ["ensureSeries", "createManyEpisodes"]);
    assert.deepEqual(incrementSeriesProgress.mock.calls[0]?.arguments.slice(0, 4), [
      USER_ID,
      SERIES_ID,
      1,
      NOW
    ]);
    assert.equal(result.episodeId, episode.id);
  });

  it("does not increment watchCount for a newly watched special", async (t) => {
    mockTransaction(t);
    const special = makeEpisode(100, 0);
    t.mock.method(episodeRepository, "findOne", async () => special);
    t.mock.method(seriesRepository, "findOne", async () => series);
    t.mock.method(userRepository, "ensureSeries", async () => ({ count: 1 }));
    t.mock.method(userRepository, "createManyEpisodes", async () => [makeUserEpisode(special.id)]);
    const incrementSeriesProgress = t.mock.method(
      userRepository,
      "incrementSeriesProgress",
      async () => makeUserSeries({ watchCount: 0 })
    );
    t.mock.method(userRepository, "updateSeries", async () => makeUserSeries({ watchCount: 0 }));
    t.mock.method(userRepository, "getEpisodeFeedItem", async () => null);

    await userService.userEpisodePost(USER_ID, { seriesId: SERIES_ID, episodeId: special.id }, NOW);

    assert.deepEqual(incrementSeriesProgress.mock.calls[0]?.arguments.slice(0, 4), [
      USER_ID,
      SERIES_ID,
      0,
      NOW
    ]);
  });

  it("uses only actually created season rows for the atomic increment", async (t) => {
    mockTransaction(t);
    const episodes = [makeEpisode(101), makeEpisode(102), makeEpisode(103)];
    const createdUserEpisodes = [makeUserEpisode(102), makeUserEpisode(103)];
    const events: string[] = [];
    const findEpisodes = t.mock.method(episodeRepository, "findMany", async () => episodes);
    t.mock.method(seriesRepository, "findOne", async () => series);
    t.mock.method(userRepository, "ensureSeries", async () => {
      events.push("ensureSeries");
      return { count: 1 };
    });
    t.mock.method(userRepository, "createManyEpisodes", async () => {
      events.push("createManyEpisodes");
      return createdUserEpisodes;
    });
    const incrementSeriesProgress = t.mock.method(
      userRepository,
      "incrementSeriesProgress",
      async () => makeUserSeries({ watchCount: 2 })
    );
    t.mock.method(userRepository, "updateSeries", async () => makeUserSeries({ watchCount: 2 }));

    const result = await userService.userSeasonPost(
      USER_ID,
      { seriesId: SERIES_ID, seasonId: SEASON_ID },
      NOW
    );

    assert.deepEqual(findEpisodes.mock.calls[0]?.arguments[0], {
      seriesId: SERIES_ID,
      seasonId: SEASON_ID,
      airDate: { lt: NEXT_UTC_DAY }
    });
    assert.deepEqual(events, ["ensureSeries", "createManyEpisodes"]);
    assert.deepEqual(incrementSeriesProgress.mock.calls[0]?.arguments.slice(0, 4), [
      USER_ID,
      SERIES_ID,
      2,
      NOW
    ]);
    assert.equal(result, createdUserEpisodes);
  });

  it("does not apply the release-date filter when deleting one episode", async (t) => {
    mockTransaction(t);
    const episode = makeEpisode(101);
    const deleted = [makeUserEpisode(episode.id)];
    const findEpisode = t.mock.method(episodeRepository, "findOne", async () => episode);
    t.mock.method(seriesRepository, "findOne", async () => series);
    t.mock.method(userRepository, "findOneSeries", async () => makeUserSeries());
    t.mock.method(userRepository, "deleteEpisodes", async () => deleted);
    const updateSeries = t.mock.method(userRepository, "updateSeries", async () =>
      makeUserSeries({ watchCount: 1 })
    );

    const result = await userService.userEpisodeDelete(USER_ID, {
      seriesId: SERIES_ID,
      episodeId: episode.id
    });

    assert.deepEqual(findEpisode.mock.calls[0]?.arguments[0], {
      id: episode.id,
      seriesId: SERIES_ID
    });
    assert.deepEqual(updateSeries.mock.calls[0]?.arguments[1], {
      watchCount: { decrement: 1 }
    });
    assert.equal(result, deleted[0]);
  });

  it("uses only actually deleted season rows for the decrement, without an airDate filter", async (t) => {
    mockTransaction(t);
    const episodes = [makeEpisode(101), makeEpisode(102), makeEpisode(103)];
    const deleted = [makeUserEpisode(101), makeUserEpisode(103)];
    const findEpisodes = t.mock.method(episodeRepository, "findMany", async () => episodes);
    t.mock.method(seriesRepository, "findOne", async () => series);
    t.mock.method(userRepository, "findOneSeries", async () => makeUserSeries({ watchCount: 3 }));
    t.mock.method(userRepository, "deleteEpisodes", async () => deleted);
    const updateSeries = t.mock.method(userRepository, "updateSeries", async () =>
      makeUserSeries({ watchCount: 1 })
    );

    const result = await userService.userSeasonDelete(USER_ID, {
      seriesId: SERIES_ID,
      seasonId: SEASON_ID
    });

    assert.deepEqual(findEpisodes.mock.calls[0]?.arguments[0], {
      seriesId: SERIES_ID,
      seasonId: SEASON_ID
    });
    assert.deepEqual(updateSeries.mock.calls[0]?.arguments[1], {
      watchCount: { decrement: deleted.length }
    });
    assert.equal(result, deleted);
  });

  it("does not decrement watchCount when deleting watched specials", async (t) => {
    mockTransaction(t);
    const specials = [makeEpisode(100, 0), makeEpisode(101, 0)];
    t.mock.method(episodeRepository, "findMany", async () => specials);
    t.mock.method(seriesRepository, "findOne", async () => series);
    t.mock.method(userRepository, "findOneSeries", async () => makeUserSeries({ watchCount: 4 }));
    t.mock.method(userRepository, "deleteEpisodes", async () =>
      specials.map((episode) => makeUserEpisode(episode.id))
    );
    const updateSeries = t.mock.method(userRepository, "updateSeries", async () =>
      makeUserSeries({ watchCount: 4 })
    );

    await userService.userSeasonDelete(USER_ID, {
      seriesId: SERIES_ID,
      seasonId: SEASON_ID
    });

    assert.deepEqual(updateSeries.mock.calls[0]?.arguments[1], {
      watchCount: { decrement: 0 }
    });
  });

  it("recalculates statuses for one user with the two-month inactivity cutoff", async (t) => {
    const updateManySeries = t.mock.method(userRepository, "updateManySeries", async () => ({
      count: 2
    }));

    const result = await userService.userStatusRecalculatePost({ userId: USER_ID }, NOW);

    assert.deepEqual(updateManySeries.mock.calls[0]?.arguments, [
      {
        userId: USER_ID,
        status: "WATCHING",
        lastWatchedAt: { lte: new Date("2026-06-08T15:30:00.000Z") }
      },
      { status: "DROPPED" }
    ]);
    assert.deepEqual(result, { updatedCount: 2 });
  });

  it("recalculates statuses for all users in one updateMany", async (t) => {
    const updateManySeries = t.mock.method(userRepository, "updateManySeries", async () => ({
      count: 3
    }));

    const result = await userService.allUserStatusesRecalculatePost(NOW);

    assert.equal(updateManySeries.mock.callCount(), 1);
    assert.deepEqual(updateManySeries.mock.calls[0]?.arguments, [
      {
        status: "WATCHING",
        lastWatchedAt: { lte: new Date("2026-06-08T15:30:00.000Z") }
      },
      { status: "DROPPED" }
    ]);
    assert.deepEqual(result, { updatedCount: 3 });
  });
});
