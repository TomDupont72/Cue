import assert from "node:assert/strict";
import { isDeepStrictEqual } from "node:util";
import type { UserSeries } from "@/generated/prisma/client.js";
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
  DatabaseFixtureRecordByCollection,
  DatabaseFixtureRow
} from "@/test/bdd/data/database/database-fixture.schemas.js";
import {
  DATABASE_FIXTURE_IDENTITY_FIELDS,
  parseDatabaseFixtureFieldsUpdate,
  parseDatabaseFixtureRow,
  parseDatabaseFixtureRowSelection
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
    "SeriesProvider",
    "Provider",
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

function getUserSeriesIdentity(row: Pick<UserSeries, "userId" | "seriesId">) {
  return `${row.userId}:${row.seriesId}`;
}

function getDatabaseRecordIdentity(
  collection: DatabaseFixtureCollection,
  row: DatabaseFixtureRecord
) {
  const values = row as unknown as Record<string, unknown>;

  return JSON.stringify(DATABASE_FIXTURE_IDENTITY_FIELDS[collection].map((field) => values[field]));
}

function formatDatabaseRecordIdentity(
  collection: DatabaseFixtureCollection,
  row: DatabaseFixtureRecord
) {
  const values = row as unknown as Record<string, unknown>;

  return DATABASE_FIXTURE_IDENTITY_FIELDS[collection]
    .map((field) => `${field}=${String(values[field])}`)
    .join(", ");
}

function withoutAutoUpdatedAt(collection: DatabaseFixtureCollection, row: DatabaseFixtureRecord) {
  if (
    collection !== "series" &&
    collection !== "seasons" &&
    collection !== "episodes" &&
    collection !== "genres" &&
    collection !== "networks" &&
    collection !== "providers" &&
    collection !== "people" &&
    collection !== "characters"
  ) {
    return row;
  }

  const record = { ...(row as unknown as Record<string, unknown>) };
  delete record.updatedAt;

  return record;
}

export class TestDatabase {
  private fixtures: LoadedDatabaseFixtures = createEmptyDatabaseFixtures();
  private databaseBeforeRequest?: DatabaseFixtureState;

  addFixtures<Collection extends DatabaseFixtureCollection>(
    collection: Collection,
    rows: readonly DatabaseFixtureRow[]
  ) {
    return addDatabaseFixtureRows(this.fixtures, collection, rows);
  }

  getFixture(reference: string): DatabaseFixtureRecord {
    return getDatabaseFixture(this.fixtures, reference);
  }

  async snapshotBeforeRequest() {
    const [
      series,
      seasons,
      episodes,
      genres,
      networks,
      providers,
      people,
      characters,
      seriesGenres,
      seriesNetworks,
      seriesProviders,
      seriesPeople,
      episodePeople,
      episodeCharacters,
      userSeries,
      userEpisodes
    ] = await Promise.all([
      prisma.series.findMany(),
      prisma.season.findMany(),
      prisma.episode.findMany(),
      prisma.genre.findMany(),
      prisma.network.findMany(),
      prisma.provider.findMany(),
      prisma.people.findMany(),
      prisma.character.findMany(),
      prisma.seriesGenre.findMany(),
      prisma.seriesNetwork.findMany(),
      prisma.seriesProvider.findMany(),
      prisma.seriesPeople.findMany(),
      prisma.episodePeople.findMany(),
      prisma.episodeCharacter.findMany(),
      prisma.userSeries.findMany(),
      prisma.userEpisode.findMany()
    ]);

    this.databaseBeforeRequest = {
      series,
      seasons,
      episodes,
      genres,
      networks,
      providers,
      people,
      characters,
      seriesGenres,
      seriesNetworks,
      seriesProviders,
      seriesPeople,
      episodePeople,
      episodeCharacters,
      userSeries,
      userEpisodes
    };
  }

  private async findDatabaseRows<Collection extends DatabaseFixtureCollection>(
    collection: Collection
  ): Promise<DatabaseFixtureRecordByCollection[Collection][]> {
    let rows: DatabaseFixtureRecord[];

    switch (collection) {
      case "series":
        rows = await prisma.series.findMany();
        break;
      case "seasons":
        rows = await prisma.season.findMany();
        break;
      case "episodes":
        rows = await prisma.episode.findMany();
        break;
      case "genres":
        rows = await prisma.genre.findMany();
        break;
      case "networks":
        rows = await prisma.network.findMany();
        break;
      case "providers":
        rows = await prisma.provider.findMany();
        break;
      case "people":
        rows = await prisma.people.findMany();
        break;
      case "characters":
        rows = await prisma.character.findMany();
        break;
      case "seriesGenres":
        rows = await prisma.seriesGenre.findMany();
        break;
      case "seriesNetworks":
        rows = await prisma.seriesNetwork.findMany();
        break;
      case "seriesProviders":
        rows = await prisma.seriesProvider.findMany();
        break;
      case "seriesPeople":
        rows = await prisma.seriesPeople.findMany();
        break;
      case "episodePeople":
        rows = await prisma.episodePeople.findMany();
        break;
      case "episodeCharacters":
        rows = await prisma.episodeCharacter.findMany();
        break;
      case "userSeries":
        rows = await prisma.userSeries.findMany();
        break;
      case "userEpisodes":
        rows = await prisma.userEpisode.findMany();
        break;
    }

    return rows as DatabaseFixtureRecordByCollection[Collection][];
  }

  private getDatabaseRowsBeforeRequest<Collection extends DatabaseFixtureCollection>(
    collection: Collection
  ): DatabaseFixtureRecordByCollection[Collection][] {
    if (!this.databaseBeforeRequest) {
      throw new Error("No database snapshot is available; send a request first");
    }

    return this.databaseBeforeRequest[collection];
  }

  private captureDatabaseFixtures<Collection extends DatabaseFixtureCollection>(
    collection: Collection,
    fixtures: Array<{
      key: string;
      record: DatabaseFixtureRecordByCollection[Collection];
    }>
  ) {
    const references = this.fixtures.references[collection] as Map<
      string,
      DatabaseFixtureRecordByCollection[Collection]
    >;
    const keys = new Set<string>();

    for (const { key } of fixtures) {
      if (references.has(key) || keys.has(key)) {
        throw new Error(`Duplicate database fixture reference @${collection}.${key}`);
      }

      keys.add(key);
    }

    for (const { key, record } of fixtures) {
      references.set(key, record);
    }
  }

  private assertDatabaseRows<Collection extends DatabaseFixtureCollection>(
    collection: Collection,
    rows: readonly DatabaseFixtureRow[],
    actualRows: readonly DatabaseFixtureRecordByCollection[Collection][],
    label: string = collection
  ) {
    const expectations = rows.map((row, index) => {
      try {
        const fixture = parseDatabaseFixtureRow(collection, row, this.fixtures.references);

        return {
          ...fixture,
          fields: Object.keys(row).filter((field) => field !== "key")
        };
      } catch (error) {
        throw new Error(`Invalid expected ${collection} row ${index + 1}`, { cause: error });
      }
    });

    assert.equal(
      actualRows.length,
      expectations.length,
      `Expected ${expectations.length} ${label} rows, received ${actualRows.length}`
    );

    const expectedIdentities = new Set<string>();
    const capturedFixtures: Array<{
      key: string;
      record: DatabaseFixtureRecordByCollection[Collection];
    }> = [];

    for (const { key, record, fields } of expectations) {
      const identity = getDatabaseRecordIdentity(collection, record);
      const readableIdentity = formatDatabaseRecordIdentity(collection, record);

      if (expectedIdentities.has(identity)) {
        throw new Error(`Duplicate expected ${collection} row: ${readableIdentity}`);
      }

      expectedIdentities.add(identity);

      const actual = actualRows.find(
        (row) => getDatabaseRecordIdentity(collection, row) === identity
      );

      assert.ok(actual, `Missing ${collection} row: ${readableIdentity}`);

      const expectedFields = Object.fromEntries(
        fields.map((field) => [field, record[field as keyof typeof record]])
      );
      const actualFields = Object.fromEntries(
        fields.map((field) => [field, actual[field as keyof typeof actual]])
      );

      assert.deepStrictEqual(
        actualFields,
        expectedFields,
        `Unexpected ${collection} row: ${readableIdentity}`
      );

      if (key !== undefined) {
        capturedFixtures.push({ key, record: actual });
      }
    }

    this.captureDatabaseFixtures(collection, capturedFixtures);
  }

  private assertUserSeriesRows(
    rows: readonly DatabaseFixtureRow[],
    actualRows: readonly UserSeries[],
    label = "userSeries"
  ) {
    const expectations = rows.map((row, index) => {
      try {
        const fixture = parseDatabaseFixtureRow("userSeries", row, this.fixtures.references);

        return {
          ...fixture,
          fields: Object.keys(row).filter((field) => field !== "key")
        };
      } catch (error) {
        throw new Error(`Invalid expected userSeries row ${index + 1}`, { cause: error });
      }
    });

    assert.equal(
      actualRows.length,
      expectations.length,
      `Expected ${expectations.length} ${label} rows, received ${actualRows.length}`
    );

    const expectedIdentities = new Set<string>();
    const capturedFixtures: Array<{ key: string; record: (typeof actualRows)[number] }> = [];

    for (const { key, record, fields } of expectations) {
      const identity = getUserSeriesIdentity(record);

      if (expectedIdentities.has(identity)) {
        throw new Error(`Duplicate expected userSeries row: ${identity}`);
      }

      expectedIdentities.add(identity);

      const actual = actualRows.find(
        (row) => row.userId === record.userId && row.seriesId === record.seriesId
      );

      assert.ok(actual, `Missing userSeries row: ${identity}`);
      const rowBeforeRequest = this.databaseBeforeRequest?.userSeries.find(
        (row) => getUserSeriesIdentity(row) === identity
      );
      const businessFields = fields.filter((field) => field !== "userId" && field !== "seriesId");
      const isIdentityOnly = businessFields.length === 0;
      let expectedRecord = record;

      if (rowBeforeRequest && isIdentityOnly) {
        expectedRecord = rowBeforeRequest;

        assert.deepStrictEqual(actual, expectedRecord, `Unexpected userSeries row: ${identity}`);
      } else {
        const expectedFields = Object.fromEntries(
          fields.map((field) => [field, record[field as keyof typeof record]])
        );
        const actualFields = Object.fromEntries(
          fields.map((field) => [field, actual[field as keyof typeof actual]])
        );

        assert.deepStrictEqual(
          actualFields,
          expectedFields,
          `Unexpected userSeries row: ${identity}`
        );
      }

      if (key !== undefined) {
        const missingFields =
          rowBeforeRequest && isIdentityOnly
            ? []
            : Object.keys(record).filter((field) => !fields.includes(field));

        if (missingFields.length > 0) {
          throw new Error(
            `Cannot capture @userSeries.${key}: add these expected fields first: ${missingFields.join(", ")}`
          );
        }

        capturedFixtures.push({ key, record: expectedRecord });
      }
    }

    for (const { key, record } of capturedFixtures) {
      if (this.fixtures.references.userSeries.has(key)) {
        throw new Error(`Duplicate database fixture reference @userSeries.${key}`);
      }

      this.fixtures.references.userSeries.set(key, record);
    }
  }

  async assertExactlyUserSeries(rows: readonly DatabaseFixtureRow[]) {
    this.assertUserSeriesRows(rows, await prisma.userSeries.findMany());
  }

  async assertAddedDatabaseRows<Collection extends DatabaseFixtureCollection>(
    collection: Collection,
    rows: readonly DatabaseFixtureRow[]
  ) {
    const rowsBeforeRequest = this.getDatabaseRowsBeforeRequest(collection);
    const actualRows = await this.findDatabaseRows(collection);
    const identitiesBeforeRequest = new Set(
      rowsBeforeRequest.map((row) => getDatabaseRecordIdentity(collection, row))
    );

    for (const rowBeforeRequest of rowsBeforeRequest) {
      const identity = getDatabaseRecordIdentity(collection, rowBeforeRequest);
      const readableIdentity = formatDatabaseRecordIdentity(collection, rowBeforeRequest);
      const actual = actualRows.find(
        (row) => getDatabaseRecordIdentity(collection, row) === identity
      );

      assert.ok(actual, `${collection} row was unexpectedly removed: ${readableIdentity}`);
      assert.deepStrictEqual(
        actual,
        rowBeforeRequest,
        `${collection} row was unexpectedly changed: ${readableIdentity}`
      );
    }

    const addedRows = actualRows.filter(
      (row) => !identitiesBeforeRequest.has(getDatabaseRecordIdentity(collection, row))
    );

    this.assertDatabaseRows(collection, rows, addedRows, `added ${collection}`);
  }

  async assertDeletedDatabaseRows<Collection extends DatabaseFixtureCollection>(
    collection: Collection,
    rows: readonly DatabaseFixtureRow[]
  ) {
    const rowsBeforeRequest = this.getDatabaseRowsBeforeRequest(collection);
    const actualRows = await this.findDatabaseRows(collection);
    const beforeByIdentity = new Map(
      rowsBeforeRequest.map((row) => [getDatabaseRecordIdentity(collection, row), row])
    );
    const afterByIdentity = new Map(
      actualRows.map((row) => [getDatabaseRecordIdentity(collection, row), row])
    );
    const expectations = rows.map((row, index) => {
      try {
        return parseDatabaseFixtureRowSelection(collection, row, this.fixtures.references);
      } catch (error) {
        throw new Error(`Invalid expected ${collection} deletion, row ${index + 1}`, {
          cause: error
        });
      }
    });
    const expectedIdentities = expectations.map(({ identity }) =>
      getDatabaseRecordIdentity(collection, identity as unknown as DatabaseFixtureRecord)
    );

    if (new Set(expectedIdentities).size !== expectedIdentities.length) {
      throw new Error(`The expected ${collection} deletions contain duplicate rows`);
    }

    const deletedIdentities = rowsBeforeRequest
      .filter((row) => !afterByIdentity.has(getDatabaseRecordIdentity(collection, row)))
      .map((row) => getDatabaseRecordIdentity(collection, row));

    assert.deepStrictEqual(
      deletedIdentities.sort(),
      [...expectedIdentities].sort(),
      `The deleted ${collection} rows do not match the expected rows`
    );

    for (const rowAfterRequest of actualRows) {
      const identity = getDatabaseRecordIdentity(collection, rowAfterRequest);
      const readableIdentity = formatDatabaseRecordIdentity(collection, rowAfterRequest);
      const rowBeforeRequest = beforeByIdentity.get(identity);

      assert.ok(rowBeforeRequest, `${collection} row was unexpectedly added: ${readableIdentity}`);
      assert.deepStrictEqual(
        rowAfterRequest,
        rowBeforeRequest,
        `${collection} row was unexpectedly changed: ${readableIdentity}`
      );
    }

    const capturedFixtures: Array<{
      key: string;
      record: DatabaseFixtureRecordByCollection[Collection];
    }> = [];

    for (const [index, { key, identity, fields }] of expectations.entries()) {
      const rowBeforeRequest = beforeByIdentity.get(expectedIdentities[index]);
      const readableIdentity = formatDatabaseRecordIdentity(
        collection,
        identity as unknown as DatabaseFixtureRecord
      );

      assert.ok(
        rowBeforeRequest,
        `${collection} row did not exist before the request: ${readableIdentity}`
      );

      for (const [field, expectedValue] of Object.entries(fields)) {
        assert.deepStrictEqual(
          rowBeforeRequest[field as keyof typeof rowBeforeRequest],
          expectedValue,
          `Unexpected deleted ${collection} row: ${readableIdentity}.${field}`
        );
      }

      if (key !== undefined) {
        capturedFixtures.push({ key, record: rowBeforeRequest });
      }
    }

    this.captureDatabaseFixtures(collection, capturedFixtures);
  }

  async assertUpdatedDatabaseFields<Collection extends DatabaseFixtureCollection>(
    collection: Collection,
    rows: readonly DatabaseFixtureRow[]
  ) {
    const rowsBeforeRequest = this.getDatabaseRowsBeforeRequest(collection);
    const expectations = rows.map((row, index) => {
      try {
        return parseDatabaseFixtureFieldsUpdate(collection, row, this.fixtures.references);
      } catch (error) {
        throw new Error(`Invalid expected ${collection} update, row ${index + 1}`, {
          cause: error
        });
      }
    });
    const actualRows = await this.findDatabaseRows(collection);
    const rowsBeforeRequestByIdentity = new Map(
      rowsBeforeRequest.map((row) => [getDatabaseRecordIdentity(collection, row), row])
    );
    const actualRowsByIdentity = new Map(
      actualRows.map((row) => [getDatabaseRecordIdentity(collection, row), row])
    );

    assert.deepStrictEqual(
      [...actualRowsByIdentity.keys()].sort(),
      [...rowsBeforeRequestByIdentity.keys()].sort(),
      `A ${collection} fields update must not add or remove rows`
    );

    const expectedIdentities = expectations.map(({ identity }) =>
      getDatabaseRecordIdentity(collection, identity as unknown as DatabaseFixtureRecord)
    );

    if (new Set(expectedIdentities).size !== expectedIdentities.length) {
      throw new Error(`The expected ${collection} updates contain duplicate rows`);
    }

    const changedIdentities = actualRows
      .filter((row) => {
        const rowBeforeRequest = rowsBeforeRequestByIdentity.get(
          getDatabaseRecordIdentity(collection, row)
        );

        return !isDeepStrictEqual(row, rowBeforeRequest);
      })
      .map((row) => getDatabaseRecordIdentity(collection, row));

    assert.deepStrictEqual(
      changedIdentities.sort(),
      [...expectedIdentities].sort(),
      `The updated ${collection} rows do not match the expected rows`
    );

    const capturedFixtures: Array<{
      key: string;
      record: DatabaseFixtureRecordByCollection[Collection];
    }> = [];

    for (const [index, expectation] of expectations.entries()) {
      const { key, fields } = expectation;
      const identity = expectedIdentities[index];
      const rowBeforeRequest = rowsBeforeRequestByIdentity.get(identity);
      const actual = actualRowsByIdentity.get(identity);
      const readableIdentity = formatDatabaseRecordIdentity(
        collection,
        expectation.identity as unknown as DatabaseFixtureRecord
      );

      assert.ok(
        rowBeforeRequest,
        `${collection} row did not exist before the request: ${readableIdentity}`
      );
      assert.ok(actual, `Missing updated ${collection} row: ${readableIdentity}`);

      for (const [field, expectedValue] of Object.entries(fields)) {
        assert.ok(
          !isDeepStrictEqual(
            rowBeforeRequest[field as keyof typeof rowBeforeRequest],
            expectedValue
          ),
          `${collection} field was not updated: ${readableIdentity}.${field}`
        );
      }

      const expected = {
        ...rowBeforeRequest,
        ...fields
      };

      assert.deepStrictEqual(
        withoutAutoUpdatedAt(collection, actual),
        withoutAutoUpdatedAt(collection, expected),
        `Unexpected ${collection} update: ${readableIdentity}`
      );

      if (key !== undefined) {
        capturedFixtures.push({ key, record: expected });
      }
    }

    this.captureDatabaseFixtures(collection, capturedFixtures);
  }

  async assertExactlyUserEpisodes(rows: readonly DatabaseFixtureRow[]) {
    const expectations = rows.map((row, index) => {
      try {
        const fixture = parseDatabaseFixtureRow("userEpisodes", row, this.fixtures.references);

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
      const rowBeforeRequest = this.databaseBeforeRequest?.userEpisodes.find(
        (row) => row.userId === record.userId && row.episodeId === record.episodeId
      );
      const isIdentityOnly = fields.every((field) => field === "userId" || field === "episodeId");
      let expectedRecord = record;

      if (rowBeforeRequest && isIdentityOnly) {
        expectedRecord = rowBeforeRequest;

        assert.deepStrictEqual(actual, expectedRecord, `Unexpected userEpisode row: ${identity}`);
      } else {
        const expectedFields = Object.fromEntries(
          fields.map((field) => [field, record[field as keyof typeof record]])
        );
        const actualFields = Object.fromEntries(
          fields.map((field) => [field, actual[field as keyof typeof actual]])
        );

        assert.deepStrictEqual(
          actualFields,
          expectedFields,
          `Unexpected userEpisode row: ${identity}`
        );
      }

      if (key !== undefined) {
        const missingFields =
          rowBeforeRequest && isIdentityOnly
            ? []
            : Object.keys(record).filter((field) => !fields.includes(field));

        if (missingFields.length > 0) {
          throw new Error(
            `Cannot capture @userEpisodes.${key}: add these expected fields first: ${missingFields.join(", ")}`
          );
        }

        capturedFixtures.push({ key, record: expectedRecord });
      }
    }

    for (const { key, record } of capturedFixtures) {
      if (this.fixtures.references.userEpisodes.has(key)) {
        throw new Error(`Duplicate database fixture reference @userEpisodes.${key}`);
      }

      this.fixtures.references.userEpisodes.set(key, record);
    }
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

      if (state.genres.length > 0) {
        await tx.genre.createMany({ data: state.genres });
      }

      if (state.networks.length > 0) {
        await tx.network.createMany({ data: state.networks });
      }

      if (state.providers.length > 0) {
        await tx.provider.createMany({ data: state.providers });
      }

      if (state.people.length > 0) {
        await tx.people.createMany({ data: state.people });
      }

      if (state.characters.length > 0) {
        await tx.character.createMany({ data: state.characters });
      }

      if (state.seriesGenres.length > 0) {
        await tx.seriesGenre.createMany({ data: state.seriesGenres });
      }

      if (state.seriesNetworks.length > 0) {
        await tx.seriesNetwork.createMany({ data: state.seriesNetworks });
      }

      if (state.seriesProviders.length > 0) {
        await tx.seriesProvider.createMany({ data: state.seriesProviders });
      }

      if (state.seriesPeople.length > 0) {
        await tx.seriesPeople.createMany({ data: state.seriesPeople });
      }

      if (state.episodePeople.length > 0) {
        await tx.episodePeople.createMany({ data: state.episodePeople });
      }

      if (state.episodeCharacters.length > 0) {
        await tx.episodeCharacter.createMany({ data: state.episodeCharacters });
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
      await tx.$queryRaw`
        SELECT setval(
          pg_get_serial_sequence('"Genre"', 'id'),
          COALESCE(MAX(id), 1),
          MAX(id) IS NOT NULL
        )
        FROM "Genre"
      `;
      await tx.$queryRaw`
        SELECT setval(
          pg_get_serial_sequence('"Network"', 'id'),
          COALESCE(MAX(id), 1),
          MAX(id) IS NOT NULL
        )
        FROM "Network"
      `;
      await tx.$queryRaw`
        SELECT setval(
          pg_get_serial_sequence('"Provider"', 'id'),
          COALESCE(MAX(id), 1),
          MAX(id) IS NOT NULL
        )
        FROM "Provider"
      `;
      await tx.$queryRaw`
        SELECT setval(
          pg_get_serial_sequence('"People"', 'id'),
          COALESCE(MAX(id), 1),
          MAX(id) IS NOT NULL
        )
        FROM "People"
      `;
      await tx.$queryRaw`
        SELECT setval(
          pg_get_serial_sequence('"Character"', 'id'),
          COALESCE(MAX(id), 1),
          MAX(id) IS NOT NULL
        )
        FROM "Character"
      `;
    });
  }
}

export async function disconnectTestDatabase() {
  await prisma.$disconnect();
}
