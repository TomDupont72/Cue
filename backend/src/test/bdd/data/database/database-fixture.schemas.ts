import { z } from "zod";
import type {
  Character,
  EpisodeCharacter,
  EpisodePeople,
  Episode,
  Genre,
  Network,
  People,
  Provider,
  Season,
  Series,
  SeriesGenre,
  SeriesNetwork,
  SeriesPeople,
  SeriesProvider,
  UserEpisode,
  UserSeries
} from "@/generated/prisma/client.js";
import { UserSeriesStatus } from "@/generated/prisma/enums.js";

export type DatabaseFixtureCollection =
  | "series"
  | "seasons"
  | "episodes"
  | "genres"
  | "networks"
  | "providers"
  | "people"
  | "characters"
  | "seriesGenres"
  | "seriesNetworks"
  | "seriesProviders"
  | "seriesPeople"
  | "episodePeople"
  | "episodeCharacters"
  | "userSeries"
  | "userEpisodes";

type IdentifiedDatabaseFixtureCollection =
  "series" | "seasons" | "episodes" | "genres" | "networks" | "providers" | "people" | "characters";

export type DatabaseFixtureRow = Record<string, string>;

const DATABASE_FIXTURE_TIMESTAMP = "2026-01-01T00:00:00.000Z";

export type DatabaseFixtureRecordByCollection = {
  series: Series;
  seasons: Season;
  episodes: Episode;
  genres: Genre;
  networks: Network;
  providers: Provider;
  people: People;
  characters: Character;
  seriesGenres: SeriesGenre;
  seriesNetworks: SeriesNetwork;
  seriesProviders: SeriesProvider;
  seriesPeople: SeriesPeople;
  episodePeople: EpisodePeople;
  episodeCharacters: EpisodeCharacter;
  userSeries: UserSeries;
  userEpisodes: UserEpisode;
};

export type DatabaseFixtureRecord = DatabaseFixtureRecordByCollection[DatabaseFixtureCollection];

export type DatabaseFixtureReferences = {
  [Collection in DatabaseFixtureCollection]: Map<
    string,
    DatabaseFixtureRecordByCollection[Collection]
  >;
};

type ParsedDatabaseFixtureRow<
  Collection extends DatabaseFixtureCollection = DatabaseFixtureCollection
> = {
  key: string | undefined;
  record: DatabaseFixtureRecordByCollection[Collection];
};

export const DATABASE_FIXTURE_IDENTITY_FIELDS = {
  series: ["id"],
  seasons: ["id"],
  episodes: ["id"],
  genres: ["id"],
  networks: ["id"],
  providers: ["id"],
  people: ["id"],
  characters: ["id"],
  seriesGenres: ["seriesId", "genreId"],
  seriesNetworks: ["seriesId", "networkId"],
  seriesProviders: ["seriesId", "providerId"],
  seriesPeople: ["seriesId", "peopleId"],
  episodePeople: ["episodeId", "peopleId"],
  episodeCharacters: ["episodeId", "characterId"],
  userSeries: ["userId", "seriesId"],
  userEpisodes: ["userId", "episodeId"]
} as const satisfies {
  [
    Collection in DatabaseFixtureCollection
  ]: readonly (keyof DatabaseFixtureRecordByCollection[Collection])[];
};

type DatabaseFixtureIdentityField<Collection extends DatabaseFixtureCollection> = Extract<
  (typeof DATABASE_FIXTURE_IDENTITY_FIELDS)[Collection][number],
  keyof DatabaseFixtureRecordByCollection[Collection]
>;

export type ParsedDatabaseFixtureFieldsUpdate<
  Collection extends DatabaseFixtureCollection = DatabaseFixtureCollection
> = {
  key: string | undefined;
  identity: Pick<
    DatabaseFixtureRecordByCollection[Collection],
    DatabaseFixtureIdentityField<Collection>
  >;
  fields: Partial<
    Omit<DatabaseFixtureRecordByCollection[Collection], DatabaseFixtureIdentityField<Collection>>
  >;
};

const fixtureKeySchema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z][A-Za-z0-9_-]*$/, "must be a valid fixture key");

const optionalFixtureKeySchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  fixtureKeySchema.optional()
);

const integerCellSchema = z
  .string()
  .regex(/^-?(?:0|[1-9]\d*)$/, "must be an integer")
  .transform(Number)
  .pipe(z.number().int());

const numberCellSchema = z
  .string()
  .regex(/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/, "must be a number")
  .transform(Number)
  .pipe(z.number().finite());

const booleanCellSchema = z.enum(["true", "false"]).transform((value) => value === "true");

const dateCellSchema = z.iso.datetime().transform((value) => new Date(value));

const nullableDateCellSchema = z.preprocess(
  (value) => (value === "" || value === "null" ? null : value),
  dateCellSchema.nullable()
);

const nullableStringCellSchema = z.preprocess(
  (value) => (value === "" || value === "null" ? null : value),
  z.string().nullable()
);

const nullableBooleanCellSchema = z.preprocess(
  (value) => (value === "" || value === "null" ? null : value),
  booleanCellSchema.nullable()
);

const nullableNumberCellSchema = z.preprocess(
  (value) => (value === "" || value === "null" ? null : value),
  numberCellSchema.nullable()
);

const fixtureReferencePattern = /^@([A-Za-z][A-Za-z0-9_-]*)\.([A-Za-z][A-Za-z0-9_-]*)$/;

export function parseDatabaseFixtureReference(reference: string): {
  collection: DatabaseFixtureCollection;
  key: string;
} {
  const match = fixtureReferencePattern.exec(reference);

  if (!match) {
    throw new Error(`Invalid database fixture reference: ${reference}`);
  }

  const [, collection, key] = match;

  if (!isDatabaseFixtureCollection(collection)) {
    throw new Error(`Unknown database fixture collection: ${collection}`);
  }

  return { collection, key };
}

function isDatabaseFixtureCollection(value: string): value is DatabaseFixtureCollection {
  return (
    value === "series" ||
    value === "seasons" ||
    value === "episodes" ||
    value === "genres" ||
    value === "networks" ||
    value === "providers" ||
    value === "people" ||
    value === "characters" ||
    value === "seriesGenres" ||
    value === "seriesNetworks" ||
    value === "seriesProviders" ||
    value === "seriesPeople" ||
    value === "episodePeople" ||
    value === "episodeCharacters" ||
    value === "userSeries" ||
    value === "userEpisodes"
  );
}

function referenceCellSchema<Collection extends IdentifiedDatabaseFixtureCollection>(
  expectedCollection: Collection,
  references: DatabaseFixtureReferences
) {
  return z.string().transform((value, context) => {
    const numericId = integerCellSchema.safeParse(value);

    if (numericId.success) {
      return numericId.data;
    }

    const match = fixtureReferencePattern.exec(value);

    if (!match) {
      context.addIssue({
        code: "custom",
        message: `must be a reference like @${expectedCollection}.key`
      });
      return z.NEVER;
    }

    const [, collection, key] = match;

    if (collection !== expectedCollection) {
      context.addIssue({
        code: "custom",
        message: `must reference ${expectedCollection}, received ${collection}`
      });
      return z.NEVER;
    }

    const referencedRecord = references[expectedCollection].get(key);

    if (!referencedRecord) {
      context.addIssue({
        code: "custom",
        message: `unknown reference @${expectedCollection}.${key}`
      });
      return z.NEVER;
    }

    return referencedRecord.id;
  });
}

function withSeriesDefaults(row: DatabaseFixtureRow): DatabaseFixtureRow {
  const name = row.name ?? `Series ${row.id}`;

  return {
    adult: "false",
    backdropPath: "null",
    firstAirDate: "null",
    tmdbId: row.id,
    inProduction: "false",
    lastAirDate: "null",
    name,
    numberOfEpisodes: "0",
    numberOfSeasons: "0",
    originalLanguage: "und",
    originalName: name,
    overview: "null",
    popularity: "0",
    posterPath: "null",
    createdAt: DATABASE_FIXTURE_TIMESTAMP,
    updatedAt: DATABASE_FIXTURE_TIMESTAMP,
    ...row
  };
}

function withSeasonDefaults(row: DatabaseFixtureRow): DatabaseFixtureRow {
  return {
    airDate: "null",
    name: `Season ${row.id}`,
    overview: "null",
    tmdbId: row.id,
    posterPath: "null",
    seasonNumber: "1",
    voteAverage: "0",
    createdAt: DATABASE_FIXTURE_TIMESTAMP,
    updatedAt: DATABASE_FIXTURE_TIMESTAMP,
    ...row
  };
}

function withEpisodeDefaults(row: DatabaseFixtureRow): DatabaseFixtureRow {
  return {
    airDate: "null",
    episodeNumber: row.id,
    name: `Episode ${row.id}`,
    overview: "null",
    tmdbId: row.id,
    stillPath: "null",
    runtime: "0",
    seasonNumber: "1",
    voteAverage: "0",
    createdAt: DATABASE_FIXTURE_TIMESTAMP,
    updatedAt: DATABASE_FIXTURE_TIMESTAMP,
    ...row
  };
}

function withGenreDefaults(row: DatabaseFixtureRow): DatabaseFixtureRow {
  return {
    tmdbId: row.id,
    name: `Genre ${row.id}`,
    createdAt: DATABASE_FIXTURE_TIMESTAMP,
    updatedAt: DATABASE_FIXTURE_TIMESTAMP,
    ...row
  };
}

function withNetworkDefaults(row: DatabaseFixtureRow): DatabaseFixtureRow {
  return {
    tmdbId: row.id,
    logoPath: "null",
    name: `Network ${row.id}`,
    createdAt: DATABASE_FIXTURE_TIMESTAMP,
    updatedAt: DATABASE_FIXTURE_TIMESTAMP,
    ...row
  };
}

function withProviderDefaults(row: DatabaseFixtureRow): DatabaseFixtureRow {
  return {
    tmdbId: row.id,
    name: `Provider ${row.id}`,
    logoPath: "null",
    displayPriority: "0",
    createdAt: DATABASE_FIXTURE_TIMESTAMP,
    updatedAt: DATABASE_FIXTURE_TIMESTAMP,
    ...row
  };
}

function withPeopleDefaults(row: DatabaseFixtureRow): DatabaseFixtureRow {
  return {
    adult: "null",
    gender: "0",
    tmdbId: row.id,
    knownForDepartment: "null",
    name: `People ${row.id}`,
    popularity: "null",
    profilePath: "null",
    createdAt: DATABASE_FIXTURE_TIMESTAMP,
    updatedAt: DATABASE_FIXTURE_TIMESTAMP,
    ...row
  };
}

function withCharacterDefaults(row: DatabaseFixtureRow): DatabaseFixtureRow {
  return {
    name: `Character ${row.id}`,
    createdAt: DATABASE_FIXTURE_TIMESTAMP,
    updatedAt: DATABASE_FIXTURE_TIMESTAMP,
    ...row
  };
}

function withoutDefaults(row: DatabaseFixtureRow): DatabaseFixtureRow {
  return row;
}

function withUserSeriesDefaults(row: DatabaseFixtureRow): DatabaseFixtureRow {
  return {
    status: "PLANNED",
    isFavorite: "false",
    watchCount: "0",
    watchedEpisodeCount: "0",
    addedAt: DATABASE_FIXTURE_TIMESTAMP,
    lastWatchedAt: "null",
    ...row
  };
}

function withUserEpisodeDefaults(row: DatabaseFixtureRow): DatabaseFixtureRow {
  return {
    watchedAt: DATABASE_FIXTURE_TIMESTAMP,
    ...row
  };
}

type DatabaseFixtureFieldSchemas = {
  [Collection in DatabaseFixtureCollection]: {
    [Field in keyof DatabaseFixtureRecordByCollection[Collection]]: z.ZodType<
      DatabaseFixtureRecordByCollection[Collection][Field]
    >;
  };
};

function createDatabaseFixtureFieldSchemas(
  references: DatabaseFixtureReferences
): DatabaseFixtureFieldSchemas {
  return {
    series: {
      id: integerCellSchema,
      adult: booleanCellSchema,
      backdropPath: nullableStringCellSchema,
      firstAirDate: nullableDateCellSchema,
      tmdbId: integerCellSchema,
      inProduction: booleanCellSchema,
      lastAirDate: nullableDateCellSchema,
      name: z.string().min(1),
      numberOfEpisodes: integerCellSchema,
      numberOfSeasons: integerCellSchema,
      originalLanguage: z.string(),
      originalName: z.string(),
      overview: nullableStringCellSchema,
      popularity: numberCellSchema,
      posterPath: nullableStringCellSchema,
      createdAt: dateCellSchema,
      updatedAt: dateCellSchema
    },
    seasons: {
      id: integerCellSchema,
      seriesId: referenceCellSchema("series", references),
      airDate: nullableDateCellSchema,
      name: z.string().min(1),
      overview: nullableStringCellSchema,
      tmdbId: integerCellSchema,
      posterPath: nullableStringCellSchema,
      seasonNumber: integerCellSchema,
      voteAverage: numberCellSchema,
      createdAt: dateCellSchema,
      updatedAt: dateCellSchema
    },
    episodes: {
      id: integerCellSchema,
      seriesId: referenceCellSchema("series", references),
      seasonId: referenceCellSchema("seasons", references),
      airDate: nullableDateCellSchema,
      episodeNumber: integerCellSchema,
      name: z.string().min(1),
      overview: nullableStringCellSchema,
      tmdbId: integerCellSchema,
      stillPath: nullableStringCellSchema,
      runtime: integerCellSchema,
      seasonNumber: integerCellSchema,
      voteAverage: numberCellSchema,
      createdAt: dateCellSchema,
      updatedAt: dateCellSchema
    },
    genres: {
      id: integerCellSchema,
      tmdbId: integerCellSchema,
      name: z.string().min(1),
      createdAt: dateCellSchema,
      updatedAt: dateCellSchema
    },
    networks: {
      id: integerCellSchema,
      tmdbId: integerCellSchema,
      logoPath: nullableStringCellSchema,
      name: z.string().min(1),
      createdAt: dateCellSchema,
      updatedAt: dateCellSchema
    },
    providers: {
      id: integerCellSchema,
      tmdbId: integerCellSchema,
      name: z.string().min(1),
      logoPath: nullableStringCellSchema,
      displayPriority: integerCellSchema,
      createdAt: dateCellSchema,
      updatedAt: dateCellSchema
    },
    people: {
      id: integerCellSchema,
      adult: nullableBooleanCellSchema,
      gender: integerCellSchema,
      tmdbId: integerCellSchema,
      knownForDepartment: nullableStringCellSchema,
      name: z.string().min(1),
      popularity: nullableNumberCellSchema,
      profilePath: nullableStringCellSchema,
      createdAt: dateCellSchema,
      updatedAt: dateCellSchema
    },
    characters: {
      id: integerCellSchema,
      peopleId: referenceCellSchema("people", references),
      name: z.string().min(1),
      createdAt: dateCellSchema,
      updatedAt: dateCellSchema
    },
    seriesGenres: {
      seriesId: referenceCellSchema("series", references),
      genreId: referenceCellSchema("genres", references)
    },
    seriesNetworks: {
      seriesId: referenceCellSchema("series", references),
      networkId: referenceCellSchema("networks", references)
    },
    seriesProviders: {
      seriesId: referenceCellSchema("series", references),
      providerId: referenceCellSchema("providers", references)
    },
    seriesPeople: {
      seriesId: referenceCellSchema("series", references),
      peopleId: referenceCellSchema("people", references)
    },
    episodePeople: {
      episodeId: referenceCellSchema("episodes", references),
      peopleId: referenceCellSchema("people", references)
    },
    episodeCharacters: {
      episodeId: referenceCellSchema("episodes", references),
      characterId: referenceCellSchema("characters", references)
    },
    userSeries: {
      userId: z.string().min(1),
      seriesId: referenceCellSchema("series", references),
      status: z.enum(UserSeriesStatus),
      isFavorite: booleanCellSchema,
      watchCount: integerCellSchema,
      watchedEpisodeCount: integerCellSchema,
      addedAt: dateCellSchema,
      lastWatchedAt: nullableDateCellSchema
    },
    userEpisodes: {
      userId: z.string().min(1),
      episodeId: referenceCellSchema("episodes", references),
      watchedAt: dateCellSchema
    }
  };
}

function createDatabaseFixtureRowSchema<Shape extends z.ZodRawShape>(shape: Shape) {
  return z
    .object({
      key: optionalFixtureKeySchema,
      ...shape
    })
    .strict()
    .transform((value) => {
      const { key, ...record } = value as Record<string, unknown> & {
        key: string | undefined;
      };

      return { key, record };
    });
}

function createDatabaseFixturePartialRowSchema<Collection extends DatabaseFixtureCollection>(
  collection: Collection,
  references: DatabaseFixtureReferences,
  requireUpdatedField: boolean
) {
  const fieldSchemas = createDatabaseFixtureFieldSchemas(references)[collection] as Record<
    string,
    z.ZodType
  >;
  const identityFields = DATABASE_FIXTURE_IDENTITY_FIELDS[collection] as readonly string[];
  const identityFieldSet = new Set(identityFields);
  const updatedFields = Object.keys(fieldSchemas).filter((field) => !identityFieldSet.has(field));
  const partialFieldSchemas = Object.fromEntries(
    Object.entries(fieldSchemas).map(([field, schema]) => [
      field,
      identityFieldSet.has(field) ? schema : schema.optional()
    ])
  );

  return z
    .object({
      key: optionalFixtureKeySchema,
      ...partialFieldSchemas
    })
    .strict()
    .superRefine((value, context) => {
      if (requireUpdatedField && !updatedFields.some((field) => Object.hasOwn(value, field))) {
        context.addIssue({
          code: "custom",
          message: "must contain at least one field to update"
        });
      }
    })
    .transform((value) => {
      const { key, ...values } = value as Record<string, unknown> & {
        key: string | undefined;
      };

      return {
        key,
        identity: Object.fromEntries(identityFields.map((field) => [field, values[field]])),
        fields: Object.fromEntries(
          updatedFields
            .filter((field) => Object.hasOwn(values, field))
            .map((field) => [field, values[field]])
        )
      };
    });
}

export function parseDatabaseFixtureRow<Collection extends DatabaseFixtureCollection>(
  collection: Collection,
  row: DatabaseFixtureRow,
  references: DatabaseFixtureReferences
): ParsedDatabaseFixtureRow<Collection> {
  const fieldSchemas = createDatabaseFixtureFieldSchemas(references);
  const schemaByCollection = {
    series: createDatabaseFixtureRowSchema(fieldSchemas.series),
    seasons: createDatabaseFixtureRowSchema(fieldSchemas.seasons),
    episodes: createDatabaseFixtureRowSchema(fieldSchemas.episodes),
    genres: createDatabaseFixtureRowSchema(fieldSchemas.genres),
    networks: createDatabaseFixtureRowSchema(fieldSchemas.networks),
    providers: createDatabaseFixtureRowSchema(fieldSchemas.providers),
    people: createDatabaseFixtureRowSchema(fieldSchemas.people),
    characters: createDatabaseFixtureRowSchema(fieldSchemas.characters),
    seriesGenres: createDatabaseFixtureRowSchema(fieldSchemas.seriesGenres),
    seriesNetworks: createDatabaseFixtureRowSchema(fieldSchemas.seriesNetworks),
    seriesProviders: createDatabaseFixtureRowSchema(fieldSchemas.seriesProviders),
    seriesPeople: createDatabaseFixtureRowSchema(fieldSchemas.seriesPeople),
    episodePeople: createDatabaseFixtureRowSchema(fieldSchemas.episodePeople),
    episodeCharacters: createDatabaseFixtureRowSchema(fieldSchemas.episodeCharacters),
    userSeries: createDatabaseFixtureRowSchema(fieldSchemas.userSeries),
    userEpisodes: createDatabaseFixtureRowSchema(fieldSchemas.userEpisodes)
  };

  const rowWithDefaultsByCollection = {
    series: withSeriesDefaults,
    seasons: withSeasonDefaults,
    episodes: withEpisodeDefaults,
    genres: withGenreDefaults,
    networks: withNetworkDefaults,
    providers: withProviderDefaults,
    people: withPeopleDefaults,
    characters: withCharacterDefaults,
    seriesGenres: withoutDefaults,
    seriesNetworks: withoutDefaults,
    seriesProviders: withoutDefaults,
    seriesPeople: withoutDefaults,
    episodePeople: withoutDefaults,
    episodeCharacters: withoutDefaults,
    userSeries: withUserSeriesDefaults,
    userEpisodes: withUserEpisodeDefaults
  } satisfies Record<DatabaseFixtureCollection, (value: DatabaseFixtureRow) => DatabaseFixtureRow>;

  return schemaByCollection[collection].parse(
    rowWithDefaultsByCollection[collection](row)
  ) as ParsedDatabaseFixtureRow<Collection>;
}

export function parseDatabaseFixtureFieldsUpdate<Collection extends DatabaseFixtureCollection>(
  collection: Collection,
  row: DatabaseFixtureRow,
  references: DatabaseFixtureReferences
): ParsedDatabaseFixtureFieldsUpdate<Collection> {
  return createDatabaseFixturePartialRowSchema(collection, references, true).parse(
    row
  ) as ParsedDatabaseFixtureFieldsUpdate<Collection>;
}

export function parseDatabaseFixtureRowSelection<Collection extends DatabaseFixtureCollection>(
  collection: Collection,
  row: DatabaseFixtureRow,
  references: DatabaseFixtureReferences
): ParsedDatabaseFixtureFieldsUpdate<Collection> {
  return createDatabaseFixturePartialRowSchema(collection, references, false).parse(
    row
  ) as ParsedDatabaseFixtureFieldsUpdate<Collection>;
}
