import { z } from "zod";
import type {
  Episode,
  Season,
  Series,
  UserEpisode,
  UserSeries
} from "@/generated/prisma/client.js";
import { UserSeriesStatus } from "@/generated/prisma/enums.js";

export type DatabaseFixtureCollection =
  "series" | "seasons" | "episodes" | "userSeries" | "userEpisodes";

type IdentifiedDatabaseFixtureCollection = "series" | "seasons" | "episodes";

export type DatabaseFixtureRow = Record<string, string>;

const DATABASE_FIXTURE_TIMESTAMP = "2026-01-01T00:00:00.000Z";

export type DatabaseFixtureRecordByCollection = {
  series: Series;
  seasons: Season;
  episodes: Episode;
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
    value === "userSeries" ||
    value === "userEpisodes"
  );
}

function referenceCellSchema<Collection extends IdentifiedDatabaseFixtureCollection>(
  expectedCollection: Collection,
  references: DatabaseFixtureReferences
) {
  return z.string().transform((value, context) => {
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

function createDatabaseFixtureFieldsUpdateSchema<Collection extends DatabaseFixtureCollection>(
  collection: Collection,
  references: DatabaseFixtureReferences
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
      if (!updatedFields.some((field) => Object.hasOwn(value, field))) {
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
    userSeries: createDatabaseFixtureRowSchema(fieldSchemas.userSeries),
    userEpisodes: createDatabaseFixtureRowSchema(fieldSchemas.userEpisodes)
  };

  const rowWithDefaultsByCollection = {
    series: withSeriesDefaults,
    seasons: withSeasonDefaults,
    episodes: withEpisodeDefaults,
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
  return createDatabaseFixtureFieldsUpdateSchema(collection, references).parse(
    row
  ) as ParsedDatabaseFixtureFieldsUpdate<Collection>;
}
