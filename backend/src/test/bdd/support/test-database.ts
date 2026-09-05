import { prisma } from "@/shared/db/prisma.js";
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
