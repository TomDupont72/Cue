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

const USER_ID = "integration-user-series-pagination";
const USER_EMAIL = "integration-user-series-pagination@example.test";
const OTHER_USER_ID = "integration-user-series-pagination-other";
const OTHER_USER_EMAIL = "integration-user-series-pagination-other@example.test";
const SERIES_COUNT = 40;
const SERIES_TMDB_IDS = Array.from({ length: SERIES_COUNT }, (_, index) => -2_091_000_000 - index);
const SAME_WATCHED_AT = new Date("2026-07-15T12:00:00.000Z");

let seriesIds: number[] = [];

type PaginationParams = {
  seriesId?: number;
  status?: "PLANNED" | "WATCHING" | "COMPLETED" | "DROPPED" | "PAUSED";
  limit: number;
};

type UserSeriesPage = Awaited<ReturnType<typeof userService.seriesGet>>;

async function removeFixtures() {
  await prisma.user.deleteMany({ where: { id: { in: [USER_ID, OTHER_USER_ID] } } });
  await prisma.series.deleteMany({ where: { tmdbId: { in: SERIES_TMDB_IDS } } });
}

async function seedFixtures() {
  await prisma.user.createMany({
    data: [
      {
        id: USER_ID,
        name: "Integration User Series Pagination",
        email: USER_EMAIL,
        emailVerified: true
      },
      {
        id: OTHER_USER_ID,
        name: "Integration User Series Pagination Other",
        email: OTHER_USER_EMAIL,
        emailVerified: true
      }
    ]
  });

  await prisma.series.createMany({
    data: SERIES_TMDB_IDS.map((tmdbId, index) => ({
      adult: false,
      tmdbId,
      inProduction: true,
      name: `Integration Pagination Series ${index + 1}`,
      numberOfEpisodes: 0,
      numberOfSeasons: 0,
      originalLanguage: "fr",
      originalName: `Integration Pagination Series ${index + 1}`,
      popularity: index
    }))
  });

  const series = await prisma.series.findMany({
    where: { tmdbId: { in: SERIES_TMDB_IDS } },
    orderBy: { tmdbId: "desc" }
  });

  seriesIds = series.map(({ id }) => id);
  assert.equal(seriesIds.length, SERIES_COUNT);
}

async function paginateAll(
  userId: string,
  params: PaginationParams,
  maxPages = 20
): Promise<UserSeriesPage[]> {
  const pages: UserSeriesPage[] = [];
  const cursors = new Set<string>();
  let cursor: string | undefined;

  for (let pageNumber = 0; pageNumber < maxPages; pageNumber += 1) {
    const page = await userService.seriesGet(userId, { ...params, cursor });
    pages.push(page);

    assert.ok(page.items.length <= params.limit);

    if (!page.hasNextPage) {
      assert.equal(page.nextCursor, null);
      return pages;
    }

    const nextCursor: unknown = page.nextCursor;

    if (typeof nextCursor !== "string") {
      assert.fail("a non-final page must expose an opaque cursor");
    }

    assert.ok(nextCursor.length > 0, "the opaque cursor must not be empty");
    assert.equal(cursors.has(nextCursor), false, "pagination must not cycle through a cursor");

    cursors.add(nextCursor);
    cursor = nextCursor;
  }

  assert.fail(`pagination did not finish within ${maxPages} pages`);
}

function assertCompleteTraversal(pages: UserSeriesPage[], expectedSeriesIds: number[]) {
  const receivedSeriesIds = pages.flatMap(({ items }) => items.map(({ seriesId }) => seriesId));

  assert.equal(
    new Set(receivedSeriesIds).size,
    receivedSeriesIds.length,
    "pages contain duplicates"
  );
  assert.deepEqual(new Set(receivedSeriesIds), new Set(expectedSeriesIds));
}

describe("user series pagination (PostgreSQL integration)", { concurrency: false }, () => {
  before(async () => {
    await removeFixtures();
    await seedFixtures();
  });

  beforeEach(async () => {
    await prisma.userSeries.deleteMany({
      where: { userId: { in: [USER_ID, OTHER_USER_ID] } }
    });
  });

  after(async () => {
    await removeFixtures();
    await prisma.$disconnect();
  });

  it("paginates 25 planned series with a null lastWatchedAt as 20 plus 5", async () => {
    const expectedSeriesIds = seriesIds.slice(0, 25);

    await prisma.userSeries.createMany({
      data: expectedSeriesIds.map((seriesId) => ({
        userId: USER_ID,
        seriesId,
        status: "PLANNED",
        lastWatchedAt: null
      }))
    });

    const pages = await paginateAll(USER_ID, { status: "PLANNED", limit: 20 });

    assert.deepEqual(
      pages.map(({ items }) => items.length),
      [20, 5]
    );
    assertCompleteTraversal(pages, expectedSeriesIds);
  });

  it("does not skip series when more than 20 rows share the same timestamp", async () => {
    const expectedSeriesIds = seriesIds.slice(0, 25);

    await prisma.userSeries.createMany({
      data: expectedSeriesIds.map((seriesId) => ({
        userId: USER_ID,
        seriesId,
        status: "WATCHING",
        lastWatchedAt: SAME_WATCHED_AT
      }))
    });

    const firstTraversal = await paginateAll(USER_ID, { status: "WATCHING", limit: 20 });
    const secondTraversal = await paginateAll(USER_ID, { status: "WATCHING", limit: 20 });

    assert.deepEqual(
      firstTraversal.map(({ items }) => items.length),
      [20, 5]
    );
    assertCompleteTraversal(firstTraversal, expectedSeriesIds);
    assert.deepEqual(
      firstTraversal.flatMap(({ items }) => items.map(({ seriesId }) => seriesId)),
      secondTraversal.flatMap(({ items }) => items.map(({ seriesId }) => seriesId)),
      "equal timestamps must use a deterministic tie-breaker"
    );
  });

  it("traverses a mix of non-null, equal and null timestamps without gaps or duplicates", async () => {
    const expectedSeriesIds = seriesIds.slice(0, 39);
    const distinctTimestampCount = 9;
    const equalTimestampCount = 21;

    await prisma.userSeries.createMany({
      data: expectedSeriesIds.map((seriesId, index) => {
        let lastWatchedAt: Date | null = null;

        if (index < distinctTimestampCount) {
          lastWatchedAt = new Date(
            SAME_WATCHED_AT.getTime() + (distinctTimestampCount - index) * 60_000
          );
        } else if (index < distinctTimestampCount + equalTimestampCount) {
          lastWatchedAt = SAME_WATCHED_AT;
        }

        return {
          userId: USER_ID,
          seriesId,
          status: "WATCHING" as const,
          lastWatchedAt
        };
      })
    });

    const pages = await paginateAll(USER_ID, { status: "WATCHING", limit: 7 });
    const items = pages.flatMap(({ items }) => items);

    assert.deepEqual(
      pages.map(({ items: pageItems }) => pageItems.length),
      [7, 7, 7, 7, 7, 4]
    );
    assertCompleteTraversal(pages, expectedSeriesIds);

    let hasReachedNullTimestamps = false;
    let previousTimestamp = Number.POSITIVE_INFINITY;

    for (const item of items) {
      if (item.lastWatchedAt === null) {
        hasReachedNullTimestamps = true;
        continue;
      }

      assert.equal(hasReachedNullTimestamps, false, "non-null timestamps must precede null values");
      assert.ok(item.lastWatchedAt.getTime() <= previousTimestamp);
      previousTimestamp = item.lastWatchedAt.getTime();
    }
  });

  it("filters by seriesId without returning another user's relation", async () => {
    const [targetSeriesId, otherVisibleSeriesId, otherUserOnlySeriesId] = seriesIds;

    assert.ok(targetSeriesId);
    assert.ok(otherVisibleSeriesId);
    assert.ok(otherUserOnlySeriesId);

    await prisma.userSeries.createMany({
      data: [
        { userId: USER_ID, seriesId: targetSeriesId, status: "PLANNED" },
        { userId: USER_ID, seriesId: otherVisibleSeriesId, status: "PLANNED" },
        { userId: OTHER_USER_ID, seriesId: otherUserOnlySeriesId, status: "PLANNED" }
      ]
    });

    const targetResult = await userService.seriesGet(USER_ID, {
      seriesId: targetSeriesId,
      limit: 20
    });
    const inaccessibleResult = await userService.seriesGet(USER_ID, {
      seriesId: otherUserOnlySeriesId,
      limit: 20
    });
    const otherUserResult = await userService.seriesGet(OTHER_USER_ID, {
      seriesId: otherUserOnlySeriesId,
      limit: 20
    });

    assert.deepEqual(
      targetResult.items.map(({ seriesId }) => seriesId),
      [targetSeriesId]
    );
    assert.deepEqual(inaccessibleResult.items, []);
    assert.deepEqual(
      otherUserResult.items.map(({ seriesId }) => seriesId),
      [otherUserOnlySeriesId]
    );
  });
});
