import assert from "node:assert/strict";
import { prisma } from "@/shared/db/prisma.js";
import { getEpisodeReleaseCutoff } from "@/modules/episode/episode.utils.js";
import type { EpisodeFeedRow } from "@/modules/user/user.types.js";
import {
  addDatabaseFixtureRows,
  createEmptyDatabaseFixtures,
  getDatabaseFixture,
  type DatabaseFixtureState,
  type LoadedDatabaseFixtures
} from "@/test/bdd/data/database/database-fixture.parser.js";
import type {
  DatabaseFixtureCollection,
  DatabaseFixtureRecord,
  DatabaseFixtureRow
} from "@/test/bdd/data/database/database-fixture.schemas.js";
import {
  parseDatabaseFixtureReference,
  parseDatabaseFixtureRow
} from "@/test/bdd/data/database/database-fixture.schemas.js";
import { assertSafeTestDatabase } from "@/test/bdd/support/test-database-safety.js";

function collectUserIds(state: DatabaseFixtureState, authenticatedUserId: string | null) {
  const userIds = new Set<string>();

  if (authenticatedUserId !== null) {
    userIds.add(authenticatedUserId);
  }

  for (const userSeries of state.userSeries) {
    userIds.add(userSeries.userId);
  }

  for (const userEpisode of state.userEpisodes) {
    userIds.add(userEpisode.userId);
  }

  return [...userIds];
}

const TRUNCATE_DATABASE_SQL = `
  TRUNCATE TABLE
    "UserEpisode",
    "UserSeries",
    "EpisodeCharacter",
    "EpisodePeople",
    "Character",
    "SeriesNetwork",
    "Network",
    "SeriesPeople",
    "People",
    "SeriesGenre",
    "Genre",
    "Episode",
    "Season",
    "Series",
    "verification",
    "account",
    "session",
    "user"
  RESTART IDENTITY CASCADE
`;

export class TestDatabase {
  private fixtures: LoadedDatabaseFixtures = createEmptyDatabaseFixtures();

  addFixtures<Collection extends DatabaseFixtureCollection>(
    collection: Collection,
    rows: readonly DatabaseFixtureRow[]
  ) {
    return addDatabaseFixtureRows(this.fixtures, collection, rows);
  }

  getFixture(reference: string): DatabaseFixtureRecord {
    return getDatabaseFixture(this.fixtures, reference);
  }

  async assertExactlyUserSeries(rows: readonly DatabaseFixtureRow[]) {
    const expectations = rows.map((row, index) => {
      try {
        const fixture = parseDatabaseFixtureRow(
          "userSeries",
          row,
          this.fixtures.references
        );

        return {
          ...fixture,
          fields: Object.keys(row).filter((field) => field !== "key")
        };
      } catch (error) {
        throw new Error(`Invalid expected userSeries row ${index + 1}`, { cause: error });
      }
    });

    const actualRows = await prisma.userSeries.findMany();

    assert.equal(
      actualRows.length,
      expectations.length,
      `Expected ${expectations.length} userSeries rows, received ${actualRows.length}`
    );

    const expectedIdentities = new Set<string>();
    const capturedFixtures: Array<{ key: string; record: (typeof actualRows)[number] }> = [];

    for (const { key, record, fields } of expectations) {
      const identity = `${record.userId}:${record.seriesId}`;

      if (expectedIdentities.has(identity)) {
        throw new Error(`Duplicate expected userSeries row: ${identity}`);
      }

      expectedIdentities.add(identity);

      const actual = actualRows.find(
        (row) => row.userId === record.userId && row.seriesId === record.seriesId
      );

      assert.ok(actual, `Missing userSeries row: ${identity}`);

      const expectedFields = Object.fromEntries(
        fields.map((field) => [field, record[field as keyof typeof record]])
      );
      const actualFields = Object.fromEntries(
        fields.map((field) => [field, actual[field as keyof typeof actual]])
      );

      assert.deepStrictEqual(actualFields, expectedFields, `Unexpected userSeries row: ${identity}`);

      if (key !== undefined) {
        capturedFixtures.push({ key, record: actual });
      }
    }

    for (const { key, record } of capturedFixtures) {
      if (this.fixtures.references.userSeries.has(key)) {
        throw new Error(`Duplicate database fixture reference @userSeries.${key}`);
      }

      this.fixtures.references.userSeries.set(key, record);
    }
  }

  async assertExactlyUserEpisodes(rows: readonly DatabaseFixtureRow[]) {
    const expectations = rows.map((row, index) => {
      try {
        const fixture = parseDatabaseFixtureRow(
          "userEpisodes",
          row,
          this.fixtures.references
        );

        return {
          ...fixture,
          fields: Object.keys(row).filter((field) => field !== "key")
        };
      } catch (error) {
        throw new Error(`Invalid expected userEpisode row ${index + 1}`, { cause: error });
      }
    });

    const actualRows = await prisma.userEpisode.findMany();

    assert.equal(
      actualRows.length,
      expectations.length,
      `Expected ${expectations.length} userEpisode rows, received ${actualRows.length}`
    );

    const expectedIdentities = new Set<string>();
    const capturedFixtures: Array<{ key: string; record: (typeof actualRows)[number] }> = [];

    for (const { key, record, fields } of expectations) {
      const identity = `${record.userId}:${record.episodeId}`;

      if (expectedIdentities.has(identity)) {
        throw new Error(`Duplicate expected userEpisode row: ${identity}`);
      }

      expectedIdentities.add(identity);

      const actual = actualRows.find(
        (row) => row.userId === record.userId && row.episodeId === record.episodeId
      );

      assert.ok(actual, `Missing userEpisode row: ${identity}`);

      const expectedFields = Object.fromEntries(
        fields.map((field) => [field, record[field as keyof typeof record]])
      );
      const actualFields = Object.fromEntries(
        fields.map((field) => [field, actual[field as keyof typeof actual]])
      );

      assert.deepStrictEqual(actualFields, expectedFields, `Unexpected userEpisode row: ${identity}`);

      if (key !== undefined) {
        capturedFixtures.push({ key, record: actual });
      }
    }

    for (const { key, record } of capturedFixtures) {
      if (this.fixtures.references.userEpisodes.has(key)) {
        throw new Error(`Duplicate database fixture reference @userEpisodes.${key}`);
      }

      this.fixtures.references.userEpisodes.set(key, record);
    }
  }

  async getEpisodeFeedFixture(
    reference: string,
    userId: string,
    now: Date
  ): Promise<EpisodeFeedRow> {
    const { collection, key } = parseDatabaseFixtureReference(reference);

    if (collection !== "episodes") {
      throw new Error(`Expected an episode fixture, received ${reference}`);
    }

    const episode = this.fixtures.references.episodes.get(key);

    if (!episode) {
      throw new Error(`Unknown database fixture reference: ${reference}`);
    }

    const releaseCutoff = getEpisodeReleaseCutoff(now);
    const [series, userSeries, remainingEpisodes] = await Promise.all([
      prisma.series.findUnique({ where: { id: episode.seriesId } }),
      prisma.userSeries.findUnique({
        where: { userId_seriesId: { userId, seriesId: episode.seriesId } }
      }),
      prisma.episode.count({
        where: {
          seriesId: episode.seriesId,
          seasonNumber: { not: 0 },
          airDate: { not: null, lt: releaseCutoff },
          users: { none: { userId } }
        }
      })
    ]);

    if (!series) {
      throw new Error(`Series ${episode.seriesId} does not exist`);
    }

    if (!userSeries) {
      throw new Error(`UserSeries ${userId}:${episode.seriesId} does not exist`);
    }

    return {
      userId,
      seriesId: series.id,
      status: userSeries.status,
      lastWatchedAt: userSeries.lastWatchedAt,
      seriesName: series.name,
      seriesPosterPath: series.posterPath,
      seriesTmdbId: series.tmdbId,
      id: episode.id,
      name: episode.name,
      seasonNumber: episode.seasonNumber,
      episodeNumber: episode.episodeNumber,
      airDate: episode.airDate,
      stillPath: episode.stillPath,
      runtime: episode.runtime,
      overview: episode.overview,
      remainingEpisodes
    };
  }

  async resetAndSeed(authenticatedUserId: string | null) {
    assertSafeTestDatabase(process.env);

    const state = structuredClone(this.fixtures.state);
    const userIds = collectUserIds(state, authenticatedUserId);
    const now = new Date("2026-01-01T00:00:00.000Z");

    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(TRUNCATE_DATABASE_SQL);

      if (userIds.length > 0) {
        await tx.user.createMany({
          data: userIds.map((id, index) => ({
            id,
            name: `BDD user ${index + 1}`,
            email: `bdd-user-${index + 1}@example.test`,
            emailVerified: true,
            image: null,
            createdAt: now,
            updatedAt: now
          }))
        });
      }

      if (state.series.length > 0) {
        await tx.series.createMany({ data: state.series });
      }

      if (state.seasons.length > 0) {
        await tx.season.createMany({ data: state.seasons });
      }

      if (state.episodes.length > 0) {
        await tx.episode.createMany({ data: state.episodes });
      }

      if (state.userSeries.length > 0) {
        await tx.userSeries.createMany({ data: state.userSeries });
      }

      if (state.userEpisodes.length > 0) {
        await tx.userEpisode.createMany({ data: state.userEpisodes });
      }

      await tx.$queryRaw`
        SELECT setval(
          pg_get_serial_sequence('"Series"', 'id'),
          COALESCE(MAX(id), 1),
          MAX(id) IS NOT NULL
        )
        FROM "Series"
      `;
      await tx.$queryRaw`
        SELECT setval(
          pg_get_serial_sequence('"Season"', 'id'),
          COALESCE(MAX(id), 1),
          MAX(id) IS NOT NULL
        )
        FROM "Season"
      `;
      await tx.$queryRaw`
        SELECT setval(
          pg_get_serial_sequence('"Episode"', 'id'),
          COALESCE(MAX(id), 1),
          MAX(id) IS NOT NULL
        )
        FROM "Episode"
      `;
    });
  }
}

export async function disconnectTestDatabase() {
  await prisma.$disconnect();
}
