import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

function assertDedicatedTestDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (
    process.env.NODE_ENV !== "test" ||
    process.env.INTEGRATION_TEST_DATABASE !== "true" ||
    !databaseUrl
  ) {
    throw new Error(
      "Integration tests require NODE_ENV=test, INTEGRATION_TEST_DATABASE=true, and an " +
        "explicit DATABASE_URL for a test database."
    );
  }

  let databaseName: string;

  try {
    const parsedDatabaseUrl = new URL(databaseUrl);

    if (!["postgres:", "postgresql:"].includes(parsedDatabaseUrl.protocol)) {
      throw new Error("Unsupported database protocol");
    }

    databaseName = decodeURIComponent(parsedDatabaseUrl.pathname.replace(/^\//, ""));
  } catch {
    throw new Error("Integration tests require a valid PostgreSQL DATABASE_URL.");
  }

  if (!/(^|[-_])test($|[-_])/.test(databaseName)) {
    throw new Error(
      `Refusing to run integration tests against database "${databaseName}". ` +
        'Its name must contain an explicit "test" segment (for example "cue_test").'
    );
  }
}

assertDedicatedTestDatabase();

const [{ prisma }, { userService }] = await Promise.all([
  import("@/shared/db/prisma.js"),
  import("@/modules/user/user.service.js")
]);

const USER_ID = "integration-user-progress";
const USER_EMAIL = "integration-user-progress@example.test";
const SERIES_TMDB_ID = -2_090_000_001;
const REGULAR_SEASON_TMDB_ID = -2_090_000_002;
const SPECIAL_SEASON_TMDB_ID = -2_090_000_003;

const utcToday = new Date();
const NOW = new Date(
  Date.UTC(utcToday.getUTCFullYear(), utcToday.getUTCMonth(), utcToday.getUTCDate(), 12)
);
const PAST_AIR_DATE = new Date(NOW);
PAST_AIR_DATE.setUTCDate(PAST_AIR_DATE.getUTCDate() - 1);
const TODAY_AIR_DATE = new Date(NOW);
TODAY_AIR_DATE.setUTCHours(23, 30, 0, 0);
const FUTURE_AIR_DATE = new Date(NOW);
FUTURE_AIR_DATE.setUTCDate(FUTURE_AIR_DATE.getUTCDate() + 1);

type Seed = {
  seriesId: number;
  regularSeasonId: number;
  specialSeasonId: number;
  concurrentEpisodeIds: number[];
  todayEpisodeId: number;
  futureEpisodeId: number;
  noDateEpisodeId: number;
  specialEpisodeId: number;
};

let seed: Seed;

async function removeFixtures() {
  await prisma.user.deleteMany({ where: { id: USER_ID } });
  await prisma.series.deleteMany({ where: { tmdbId: SERIES_TMDB_ID } });
}

async function resetProgress() {
  await prisma.userEpisode.deleteMany({ where: { userId: USER_ID } });
  await prisma.userSeries.deleteMany({ where: { userId: USER_ID, seriesId: seed.seriesId } });
}

async function assertWatchCountInvariant(expected?: number) {
  const [userSeries, regularEpisodeCount] = await Promise.all([
    prisma.userSeries.findUnique({
      where: { userId_seriesId: { userId: USER_ID, seriesId: seed.seriesId } }
    }),
    prisma.userEpisode.count({
      where: {
        userId: USER_ID,
        episode: { seriesId: seed.seriesId, seasonNumber: { not: 0 } }
      }
    })
  ]);

  assert.ok(userSeries, "the progress row should exist");
  assert.equal(userSeries.watchCount, regularEpisodeCount);

  if (expected !== undefined) {
    assert.equal(userSeries.watchCount, expected);
  }
}

async function seedFixtures(): Promise<Seed> {
  await prisma.user.create({
    data: {
      id: USER_ID,
      name: "Integration User Progress",
      email: USER_EMAIL,
      emailVerified: true
    }
  });

  const series = await prisma.series.create({
    data: {
      adult: false,
      tmdbId: SERIES_TMDB_ID,
      inProduction: true,
      name: "Integration User Progress",
      numberOfEpisodes: 11,
      numberOfSeasons: 1,
      originalLanguage: "fr",
      originalName: "Integration User Progress",
      popularity: 0
    }
  });

  const [regularSeason, specialSeason] = await Promise.all([
    prisma.season.create({
      data: {
        seriesId: series.id,
        airDate: PAST_AIR_DATE,
        name: "Season 1",
        tmdbId: REGULAR_SEASON_TMDB_ID,
        seasonNumber: 1,
        voteAverage: 0
      }
    }),
    prisma.season.create({
      data: {
        seriesId: series.id,
        airDate: PAST_AIR_DATE,
        name: "Specials",
        tmdbId: SPECIAL_SEASON_TMDB_ID,
        seasonNumber: 0,
        voteAverage: 0
      }
    })
  ]);

  const concurrentEpisodes = await Promise.all(
    Array.from({ length: 8 }, (_, index) =>
      prisma.episode.create({
        data: {
          seriesId: series.id,
          seasonId: regularSeason.id,
          airDate: PAST_AIR_DATE,
          episodeNumber: index + 1,
          name: `Past episode ${index + 1}`,
          tmdbId: SERIES_TMDB_ID + 100 + index,
          runtime: 45,
          seasonNumber: 1,
          voteAverage: 0
        }
      })
    )
  );

  const [todayEpisode, futureEpisode, noDateEpisode, specialEpisode] = await Promise.all([
    prisma.episode.create({
      data: {
        seriesId: series.id,
        seasonId: regularSeason.id,
        airDate: TODAY_AIR_DATE,
        episodeNumber: 9,
        name: "Today episode",
        tmdbId: SERIES_TMDB_ID + 109,
        runtime: 45,
        seasonNumber: 1,
        voteAverage: 0
      }
    }),
    prisma.episode.create({
      data: {
        seriesId: series.id,
        seasonId: regularSeason.id,
        airDate: FUTURE_AIR_DATE,
        episodeNumber: 10,
        name: "Future episode",
        tmdbId: SERIES_TMDB_ID + 110,
        runtime: 45,
        seasonNumber: 1,
        voteAverage: 0
      }
    }),
    prisma.episode.create({
      data: {
        seriesId: series.id,
        seasonId: regularSeason.id,
        airDate: null,
        episodeNumber: 11,
        name: "Undated episode",
        tmdbId: SERIES_TMDB_ID + 111,
        runtime: 45,
        seasonNumber: 1,
        voteAverage: 0
      }
    }),
    prisma.episode.create({
      data: {
        seriesId: series.id,
        seasonId: specialSeason.id,
        airDate: PAST_AIR_DATE,
        episodeNumber: 1,
        name: "Special episode",
        tmdbId: SERIES_TMDB_ID + 200,
        runtime: 45,
        seasonNumber: 0,
        voteAverage: 0
      }
    })
  ]);

  return {
    seriesId: series.id,
    regularSeasonId: regularSeason.id,
    specialSeasonId: specialSeason.id,
    concurrentEpisodeIds: concurrentEpisodes.map(({ id }) => id),
    todayEpisodeId: todayEpisode.id,
    futureEpisodeId: futureEpisode.id,
    noDateEpisodeId: noDateEpisode.id,
    specialEpisodeId: specialEpisode.id
  };
}

describe("user progress (PostgreSQL integration)", { concurrency: false }, () => {
  before(async () => {
    await removeFixtures();
    seed = await seedFixtures();
  });

  beforeEach(async () => {
    await resetProgress();
  });

  after(async () => {
    await removeFixtures();
    await prisma.$disconnect();
  });

  it("atomically counts concurrent posts for distinct episodes", async () => {
    await Promise.all(
      seed.concurrentEpisodeIds.map((episodeId) =>
        userService.userEpisodePost(USER_ID, { seriesId: seed.seriesId, episodeId }, NOW)
      )
    );

    await assertWatchCountInvariant(seed.concurrentEpisodeIds.length);
  });

  it("counts a concurrently posted duplicate episode only once", async () => {
    const episodeId = seed.concurrentEpisodeIds[0];

    await Promise.all(
      Array.from({ length: 8 }, () =>
        userService.userEpisodePost(USER_ID, { seriesId: seed.seriesId, episodeId }, NOW)
      )
    );

    assert.equal(await prisma.userEpisode.count({ where: { userId: USER_ID, episodeId } }), 1);
    await assertWatchCountInvariant(1);
  });

  it("never moves lastWatchedAt backwards", async () => {
    const newerWatchedAt = new Date(NOW);
    newerWatchedAt.setUTCHours(newerWatchedAt.getUTCHours() + 1);
    const olderWatchedAt = new Date(NOW);
    olderWatchedAt.setUTCHours(olderWatchedAt.getUTCHours() - 1);

    await userService.userEpisodePost(
      USER_ID,
      { seriesId: seed.seriesId, episodeId: seed.concurrentEpisodeIds[0] },
      newerWatchedAt
    );
    await userService.userEpisodePost(
      USER_ID,
      { seriesId: seed.seriesId, episodeId: seed.concurrentEpisodeIds[1] },
      olderWatchedAt
    );

    const userSeries = await prisma.userSeries.findUniqueOrThrow({
      where: { userId_seriesId: { userId: USER_ID, seriesId: seed.seriesId } }
    });

    assert.equal(userSeries.lastWatchedAt?.toISOString(), newerWatchedAt.toISOString());
    await assertWatchCountInvariant(2);
  });

  it("atomically counts concurrent deletes", async () => {
    await Promise.all(
      seed.concurrentEpisodeIds.map((episodeId) =>
        userService.userEpisodePost(USER_ID, { seriesId: seed.seriesId, episodeId }, NOW)
      )
    );

    await Promise.all(
      seed.concurrentEpisodeIds.map((episodeId) =>
        userService.userEpisodeDelete(USER_ID, { seriesId: seed.seriesId, episodeId })
      )
    );

    assert.equal(await prisma.userEpisode.count({ where: { userId: USER_ID } }), 0);
    await assertWatchCountInvariant(0);
  });

  it("decrements only once when the same episode is deleted concurrently", async () => {
    const episodeId = seed.concurrentEpisodeIds[0];

    await userService.userEpisodePost(USER_ID, { seriesId: seed.seriesId, episodeId }, NOW);

    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () =>
        userService.userEpisodeDelete(USER_ID, { seriesId: seed.seriesId, episodeId })
      )
    );

    assert.equal(results.filter(({ status }) => status === "fulfilled").length, 1);
    assert.equal(results.filter(({ status }) => status === "rejected").length, 7);
    await assertWatchCountInvariant(0);
  });

  it("does not count season zero episodes as series progress", async () => {
    await userService.userSeasonPost(
      USER_ID,
      { seriesId: seed.seriesId, seasonId: seed.specialSeasonId },
      NOW
    );

    assert.equal(
      await prisma.userEpisode.count({
        where: { userId: USER_ID, episodeId: seed.specialEpisodeId }
      }),
      1
    );
    await assertWatchCountInvariant(0);

    await userService.userSeasonDelete(USER_ID, {
      seriesId: seed.seriesId,
      seasonId: seed.specialSeasonId
    });
    await assertWatchCountInvariant(0);
  });

  it("allows today's episode but refuses future and undated individual episodes", async () => {
    await userService.userEpisodePost(
      USER_ID,
      { seriesId: seed.seriesId, episodeId: seed.todayEpisodeId },
      NOW
    );

    await assert.rejects(
      userService.userEpisodePost(
        USER_ID,
        { seriesId: seed.seriesId, episodeId: seed.futureEpisodeId },
        NOW
      )
    );
    await assert.rejects(
      userService.userEpisodePost(
        USER_ID,
        { seriesId: seed.seriesId, episodeId: seed.noDateEpisodeId },
        NOW
      )
    );

    await assertWatchCountInvariant(1);
  });

  it("posts only released season episodes and deletes a pre-existing future episode", async () => {
    const created = await userService.userSeasonPost(
      USER_ID,
      { seriesId: seed.seriesId, seasonId: seed.regularSeasonId },
      NOW
    );
    const expectedReleasedIds = new Set([...seed.concurrentEpisodeIds, seed.todayEpisodeId]);

    assert.deepEqual(new Set(created.map(({ episodeId }) => episodeId)), expectedReleasedIds);
    assert.equal(
      await prisma.userEpisode.count({
        where: {
          userId: USER_ID,
          episodeId: { in: [seed.futureEpisodeId, seed.noDateEpisodeId] }
        }
      }),
      0
    );
    await assertWatchCountInvariant(expectedReleasedIds.size);

    await prisma.$transaction([
      prisma.userEpisode.create({
        data: {
          userId: USER_ID,
          episodeId: seed.futureEpisodeId,
          watchedAt: NOW
        }
      }),
      prisma.userSeries.update({
        where: { userId_seriesId: { userId: USER_ID, seriesId: seed.seriesId } },
        data: { watchCount: { increment: 1 } }
      })
    ]);
    await assertWatchCountInvariant(expectedReleasedIds.size + 1);

    const deleted = await userService.userSeasonDelete(USER_ID, {
      seriesId: seed.seriesId,
      seasonId: seed.regularSeasonId
    });

    assert.ok(deleted.some(({ episodeId }) => episodeId === seed.futureEpisodeId));
    assert.equal(
      await prisma.userEpisode.count({
        where: { userId: USER_ID, episode: { seriesId: seed.seriesId } }
      }),
      0
    );
    await assertWatchCountInvariant(0);
  });

  it("enforces the database non-negative watchCount constraint", async () => {
    await prisma.userSeries.create({ data: { userId: USER_ID, seriesId: seed.seriesId } });

    await assert.rejects(
      prisma.userSeries.update({
        where: { userId_seriesId: { userId: USER_ID, seriesId: seed.seriesId } },
        data: { watchCount: { decrement: 1 } }
      })
    );

    await assertWatchCountInvariant(0);
  });
});
