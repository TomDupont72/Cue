import {
  type DatabaseFixtureCollection,
  type DatabaseFixtureRecord,
  type DatabaseFixtureRecordByCollection,
  type DatabaseFixtureRow,
  type DatabaseFixtureReferences,
  parseDatabaseFixtureReference,
  parseDatabaseFixtureRow
} from "./database-fixture.schemas.js";

export type DatabaseFixtureState = {
  [Collection in DatabaseFixtureCollection]: DatabaseFixtureRecordByCollection[Collection][];
};

export type LoadedDatabaseFixtures = {
  state: DatabaseFixtureState;
  references: DatabaseFixtureReferences;
};

function createEmptyDatabaseFixtureReferences(): DatabaseFixtureReferences {
  return {
    series: new Map(),
    seasons: new Map(),
    episodes: new Map(),
    userSeries: new Map(),
    userEpisodes: new Map()
  };
}

export function createEmptyDatabaseFixtures(): LoadedDatabaseFixtures {
  return {
    state: {
      series: [],
      seasons: [],
      episodes: [],
      userSeries: [],
      userEpisodes: []
    },
    references: createEmptyDatabaseFixtureReferences()
  };
}

function addFixtureRecord(
  collection: DatabaseFixtureCollection,
  key: string,
  record: DatabaseFixtureRecordByCollection[DatabaseFixtureCollection],
  loadedFixtures: LoadedDatabaseFixtures
) {
  const collectionReferences = loadedFixtures.references[collection] as Map<string, typeof record>;

  if (collectionReferences.has(key)) {
    throw new Error(`Duplicate database fixture reference @${collection}.${key}`);
  }

  collectionReferences.set(key, record);

  switch (collection) {
    case "series":
      loadedFixtures.state.series.push(record as DatabaseFixtureRecordByCollection["series"]);
      break;
    case "seasons":
      loadedFixtures.state.seasons.push(record as DatabaseFixtureRecordByCollection["seasons"]);
      break;
    case "episodes":
      loadedFixtures.state.episodes.push(record as DatabaseFixtureRecordByCollection["episodes"]);
      break;
    case "userSeries":
      loadedFixtures.state.userSeries.push(
        record as DatabaseFixtureRecordByCollection["userSeries"]
      );
      break;
    case "userEpisodes":
      loadedFixtures.state.userEpisodes.push(
        record as DatabaseFixtureRecordByCollection["userEpisodes"]
      );
      break;
  }
}

function getNextAutomaticSeasonId(loadedFixtures: LoadedDatabaseFixtures) {
  const greatestUsedId = loadedFixtures.state.seasons.reduce(
    (greatest, season) => Math.max(greatest, season.id, season.tmdbId),
    0
  );

  return greatestUsedId + 1;
}

function addAutomaticSeason(
  loadedFixtures: LoadedDatabaseFixtures,
  episodeRow: DatabaseFixtureRow
) {
  if (episodeRow.seasonId !== undefined || episodeRow.seriesId === undefined) {
    return episodeRow;
  }

  const { collection, key: seriesKey } = parseDatabaseFixtureReference(episodeRow.seriesId);

  if (collection !== "series") {
    throw new Error(`Expected a series fixture, received ${episodeRow.seriesId}`);
  }

  const series = loadedFixtures.references.series.get(seriesKey);

  if (!series) {
    throw new Error(`Unknown database fixture reference: ${episodeRow.seriesId}`);
  }

  const seasonNumber = episodeRow.seasonNumber ?? "1";
  const existingSeason = [...loadedFixtures.references.seasons.entries()].find(
    ([, season]) => season.seriesId === series.id && String(season.seasonNumber) === seasonNumber
  );

  if (existingSeason) {
    return {
      ...episodeRow,
      seasonId: `@seasons.${existingSeason[0]}`
    };
  }

  const id = getNextAutomaticSeasonId(loadedFixtures);
  const baseKey = `automaticSeason-${seriesKey}-${seasonNumber}`;
  let seasonKey = baseKey;
  let suffix = 2;

  while (loadedFixtures.references.seasons.has(seasonKey)) {
    seasonKey = `${baseKey}-${suffix}`;
    suffix += 1;
  }

  const { record } = parseDatabaseFixtureRow(
    "seasons",
    {
      key: seasonKey,
      id: String(id),
      seriesId: episodeRow.seriesId,
      seasonNumber
    },
    loadedFixtures.references
  );

  addFixtureRecord("seasons", seasonKey, record, loadedFixtures);

  return {
    ...episodeRow,
    seasonId: `@seasons.${seasonKey}`
  };
}

export function addDatabaseFixtureRows<Collection extends DatabaseFixtureCollection>(
  loadedFixtures: LoadedDatabaseFixtures,
  collection: Collection,
  rows: readonly DatabaseFixtureRow[]
): DatabaseFixtureRecordByCollection[Collection][] {
  const records: DatabaseFixtureRecordByCollection[Collection][] = [];

  for (const [index, row] of rows.entries()) {
    try {
      const rowWithRelations =
        collection === "episodes" ? addAutomaticSeason(loadedFixtures, row) : row;
      const { key, record } = parseDatabaseFixtureRow(
        collection,
        rowWithRelations,
        loadedFixtures.references
      );

      addFixtureRecord(collection, key, record, loadedFixtures);
      records.push(record);
    } catch (error) {
      throw new Error(`Invalid ${collection} fixture, row ${index + 1}`, { cause: error });
    }
  }

  return records;
}

export function getDatabaseFixture(
  loadedFixtures: LoadedDatabaseFixtures,
  reference: string
): DatabaseFixtureRecord {
  const { collection, key } = parseDatabaseFixtureReference(reference);
  const collectionReferences = loadedFixtures.references[collection] as Map<
    string,
    DatabaseFixtureRecord
  >;
  const record = collectionReferences.get(key);

  if (!record) {
    throw new Error(`Unknown database fixture reference: ${reference}`);
  }

  return record;
}
