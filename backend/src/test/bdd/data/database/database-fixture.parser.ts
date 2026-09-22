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
    genres: new Map(),
    networks: new Map(),
    providers: new Map(),
    people: new Map(),
    characters: new Map(),
    seriesGenres: new Map(),
    seriesNetworks: new Map(),
    seriesProviders: new Map(),
    seriesPeople: new Map(),
    episodePeople: new Map(),
    episodeCharacters: new Map(),
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
      genres: [],
      networks: [],
      providers: [],
      people: [],
      characters: [],
      seriesGenres: [],
      seriesNetworks: [],
      seriesProviders: [],
      seriesPeople: [],
      episodePeople: [],
      episodeCharacters: [],
      userSeries: [],
      userEpisodes: []
    },
    references: createEmptyDatabaseFixtureReferences()
  };
}

function addFixtureRecord(
  collection: DatabaseFixtureCollection,
  key: string | undefined,
  record: DatabaseFixtureRecordByCollection[DatabaseFixtureCollection],
  loadedFixtures: LoadedDatabaseFixtures,
  reservedKeys: ReadonlySet<string> = new Set()
) {
  const collectionReferences = loadedFixtures.references[collection] as Map<string, typeof record>;
  let resolvedKey = key;

  if (resolvedKey === undefined) {
    let suffix = loadedFixtures.state[collection].length + 1;

    do {
      resolvedKey = `anonymous-${suffix}`;
      suffix += 1;
    } while (collectionReferences.has(resolvedKey) || reservedKeys.has(resolvedKey));
  }

  if (collectionReferences.has(resolvedKey)) {
    throw new Error(`Duplicate database fixture reference @${collection}.${resolvedKey}`);
  }

  collectionReferences.set(resolvedKey, record);

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
    case "genres":
      loadedFixtures.state.genres.push(record as DatabaseFixtureRecordByCollection["genres"]);
      break;
    case "networks":
      loadedFixtures.state.networks.push(record as DatabaseFixtureRecordByCollection["networks"]);
      break;
    case "providers":
      loadedFixtures.state.providers.push(record as DatabaseFixtureRecordByCollection["providers"]);
      break;
    case "people":
      loadedFixtures.state.people.push(record as DatabaseFixtureRecordByCollection["people"]);
      break;
    case "characters":
      loadedFixtures.state.characters.push(
        record as DatabaseFixtureRecordByCollection["characters"]
      );
      break;
    case "seriesGenres":
      loadedFixtures.state.seriesGenres.push(
        record as DatabaseFixtureRecordByCollection["seriesGenres"]
      );
      break;
    case "seriesNetworks":
      loadedFixtures.state.seriesNetworks.push(
        record as DatabaseFixtureRecordByCollection["seriesNetworks"]
      );
      break;
    case "seriesProviders":
      loadedFixtures.state.seriesProviders.push(
        record as DatabaseFixtureRecordByCollection["seriesProviders"]
      );
      break;
    case "seriesPeople":
      loadedFixtures.state.seriesPeople.push(
        record as DatabaseFixtureRecordByCollection["seriesPeople"]
      );
      break;
    case "episodePeople":
      loadedFixtures.state.episodePeople.push(
        record as DatabaseFixtureRecordByCollection["episodePeople"]
      );
      break;
    case "episodeCharacters":
      loadedFixtures.state.episodeCharacters.push(
        record as DatabaseFixtureRecordByCollection["episodeCharacters"]
      );
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
  const reservedKeys = new Set(
    rows.map((row) => row.key).filter((key): key is string => key !== undefined && key !== "")
  );

  for (const [index, row] of rows.entries()) {
    try {
      const rowWithRelations =
        collection === "episodes" ? addAutomaticSeason(loadedFixtures, row) : row;
      const { key, record } = parseDatabaseFixtureRow(
        collection,
        rowWithRelations,
        loadedFixtures.references
      );

      addFixtureRecord(collection, key, record, loadedFixtures, reservedKeys);
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
