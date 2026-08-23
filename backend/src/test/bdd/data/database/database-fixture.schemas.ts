import { z } from "zod";
import type {
  Episode,
  Season,
  Series,
  UserEpisode,
  UserSeries
} from "@/generated/prisma/client.js";
import {
  episodeResponseSchema,
  seasonResponseSchema,
  seriesResponseSchema,
  userEpisodeResponseSchema,
  userSeriesResponseSchema
} from "@/modules/series/series.schemas.js";

export type DatabaseFixtureCollection =
  "series" | "seasons" | "episodes" | "userSeries" | "userEpisodes";

type IdentifiedDatabaseFixtureCollection = "series" | "seasons" | "episodes";

export type DatabaseFixtureRecordByCollection = {
  series: Series;
  seasons: Season;
  episodes: Episode;
  userSeries: UserSeries;
  userEpisodes: UserEpisode;
};

export type DatabaseFixtureReferences = {
  [Collection in DatabaseFixtureCollection]: Map<
    string,
    DatabaseFixtureRecordByCollection[Collection]
  >;
};

export type ParsedDatabaseFixtureRow<
  Collection extends DatabaseFixtureCollection = DatabaseFixtureCollection
> = {
  key: string;
  record: DatabaseFixtureRecordByCollection[Collection];
};

const fixtureKeySchema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z][A-Za-z0-9_-]*$/, "must be a valid fixture key");

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

const nullableDateCellSchema = z.union([z.literal("null").transform(() => null), dateCellSchema]);

const nullableStringCellSchema = z.union([z.literal("null").transform(() => null), z.string()]);

function referenceCellSchema<Collection extends IdentifiedDatabaseFixtureCollection>(
  expectedCollection: Collection,
  references: DatabaseFixtureReferences
) {
  return z.string().transform((value, context) => {
    const match = /^@([A-Za-z][A-Za-z0-9_-]*)\.([A-Za-z][A-Za-z0-9_-]*)$/.exec(value);

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

function createSeriesRowSchema() {
  return z
    .object({
      key: fixtureKeySchema,
      id: integerCellSchema,
      adult: booleanCellSchema,
      backdropPath: nullableStringCellSchema,
      firstAirDate: nullableDateCellSchema,
      tmdbId: integerCellSchema,
      inProduction: booleanCellSchema,
      lastAirDate: nullableDateCellSchema,
      name: z.string(),
      numberOfEpisodes: integerCellSchema,
      numberOfSeasons: integerCellSchema,
      originalLanguage: z.string(),
      originalName: z.string(),
      overview: nullableStringCellSchema,
      popularity: numberCellSchema,
      posterPath: nullableStringCellSchema,
      createdAt: dateCellSchema,
      updatedAt: dateCellSchema
    })
    .strict()
    .transform(({ key, ...record }) => ({
      key,
      record: seriesResponseSchema.parse(record)
    }));
}

function createSeasonRowSchema(references: DatabaseFixtureReferences) {
  return z
    .object({
      key: fixtureKeySchema,
      id: integerCellSchema,
      seriesId: referenceCellSchema("series", references),
      airDate: nullableDateCellSchema,
      name: z.string(),
      overview: nullableStringCellSchema,
      tmdbId: integerCellSchema,
      posterPath: nullableStringCellSchema,
      seasonNumber: integerCellSchema,
      voteAverage: numberCellSchema,
      createdAt: dateCellSchema,
      updatedAt: dateCellSchema
    })
    .strict()
    .transform(({ key, ...record }) => ({
      key,
      record: seasonResponseSchema.parse(record)
    }));
}

function createEpisodeRowSchema(references: DatabaseFixtureReferences) {
  return z
    .object({
      key: fixtureKeySchema,
      id: integerCellSchema,
      seriesId: referenceCellSchema("series", references),
      seasonId: referenceCellSchema("seasons", references),
      airDate: nullableDateCellSchema,
      episodeNumber: integerCellSchema,
      name: z.string(),
      overview: nullableStringCellSchema,
      tmdbId: integerCellSchema,
      stillPath: nullableStringCellSchema,
      runtime: integerCellSchema,
      seasonNumber: integerCellSchema,
      voteAverage: numberCellSchema,
      createdAt: dateCellSchema,
      updatedAt: dateCellSchema
    })
    .strict()
    .transform(({ key, ...record }) => ({
      key,
      record: episodeResponseSchema.parse(record)
    }));
}

function createUserSeriesRowSchema(references: DatabaseFixtureReferences) {
  return z
    .object({
      key: fixtureKeySchema,
      userId: z.string(),
      seriesId: referenceCellSchema("series", references),
      status: userSeriesResponseSchema.shape.status,
      isFavorite: booleanCellSchema,
      watchCount: integerCellSchema,
      watchedEpisodeCount: integerCellSchema,
      addedAt: dateCellSchema,
      lastWatchedAt: nullableDateCellSchema
    })
    .strict()
    .transform(({ key, ...record }) => ({
      key,
      record: userSeriesResponseSchema.parse(record)
    }));
}

function createUserEpisodeRowSchema(references: DatabaseFixtureReferences) {
  return z
    .object({
      key: fixtureKeySchema,
      userId: z.string(),
      episodeId: referenceCellSchema("episodes", references),
      watchedAt: dateCellSchema
    })
    .strict()
    .transform(({ key, ...record }) => ({
      key,
      record: userEpisodeResponseSchema.parse(record)
    }));
}

export function parseDatabaseFixtureRow<Collection extends DatabaseFixtureCollection>(
  collection: Collection,
  row: Record<string, string>,
  references: DatabaseFixtureReferences
): ParsedDatabaseFixtureRow<Collection> {
  const schemaByCollection = {
    series: createSeriesRowSchema(),
    seasons: createSeasonRowSchema(references),
    episodes: createEpisodeRowSchema(references),
    userSeries: createUserSeriesRowSchema(references),
    userEpisodes: createUserEpisodeRowSchema(references)
  };

  return schemaByCollection[collection].parse(row) as ParsedDatabaseFixtureRow<Collection>;
}
