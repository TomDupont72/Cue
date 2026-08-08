import { z } from "zod";
import { UserSeriesStatus } from "@/generated/prisma/enums.js";

const timestampsResponseShape = {
  createdAt: z.date(),
  updatedAt: z.date()
};

export const seriesResponseSchema = z.object({
  id: z.number().int(),
  adult: z.boolean(),
  backdropPath: z.string().nullable(),
  firstAirDate: z.date().nullable(),
  tmdbId: z.number().int(),
  inProduction: z.boolean(),
  lastAirDate: z.date().nullable(),
  name: z.string(),
  numberOfEpisodes: z.number().int(),
  numberOfSeasons: z.number().int(),
  originalLanguage: z.string(),
  originalName: z.string(),
  overview: z.string().nullable(),
  popularity: z.number(),
  posterPath: z.string().nullable(),
  ...timestampsResponseShape
});

export const seasonResponseSchema = z.object({
  id: z.number().int(),
  seriesId: z.number().int(),
  airDate: z.date().nullable(),
  name: z.string(),
  overview: z.string().nullable(),
  tmdbId: z.number().int(),
  posterPath: z.string().nullable(),
  seasonNumber: z.number().int(),
  voteAverage: z.number(),
  ...timestampsResponseShape
});

export const episodeResponseSchema = z.object({
  id: z.number().int(),
  seriesId: z.number().int(),
  seasonId: z.number().int(),
  airDate: z.date().nullable(),
  episodeNumber: z.number().int(),
  name: z.string(),
  overview: z.string().nullable(),
  tmdbId: z.number().int(),
  stillPath: z.string().nullable(),
  runtime: z.number().int(),
  seasonNumber: z.number().int(),
  voteAverage: z.number(),
  ...timestampsResponseShape
});

export const userSeriesResponseSchema = z.object({
  userId: z.string(),
  seriesId: z.number().int(),
  status: z.enum(UserSeriesStatus),
  isFavorite: z.boolean(),
  watchCount: z.number().int(),
  addedAt: z.date(),
  lastWatchedAt: z.date().nullable()
});

export const userEpisodeResponseSchema = z.object({
  userId: z.string(),
  episodeId: z.number().int(),
  watchedAt: z.date()
});

export const seriesGetResponseSchema = z.object({
  series: seriesResponseSchema,
  seasons: z.array(seasonResponseSchema),
  episodes: z.array(episodeResponseSchema),
  userSeries: userSeriesResponseSchema.nullable(),
  userEpisodes: z.array(userEpisodeResponseSchema)
});

export const seriesImportPostResponseSchema = z.object({
  series: seriesResponseSchema,
  userSeries: userSeriesResponseSchema.nullable()
});

export const seriesImportPostSchema = z.object({
  tmdbId: z.number().int().min(1)
});

export type SeriesImportPost = z.infer<typeof seriesImportPostSchema>;

export const seriesGetSchema = z.object({
  id: z.coerce.number().int().min(1)
});

export type SeriesGet = z.infer<typeof seriesGetSchema>;
