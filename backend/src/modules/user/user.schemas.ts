import z from "zod";
import {
  seriesResponseSchema,
  userEpisodeResponseSchema,
  userSeriesResponseSchema
} from "@/modules/series/series.schemas.js";

export const userSeriesStatuses = [
  "PLANNED",
  "WATCHING",
  "COMPLETED",
  "DROPPED",
  "PAUSED"
] as const;

export const userSeriesStatusSchema = z.enum(userSeriesStatuses);

export const userSeriesPostBodySchema = z.object({
  status: userSeriesStatusSchema.optional(),
  isFavorite: z.boolean().optional()
});

export const userSeriesPostParamsSchema = z.object({
  seriesId: z.coerce.number().int().min(1)
});

export type UserSeriesPostBody = z.infer<typeof userSeriesPostBodySchema>;
export type UserSeriesPostParams = z.infer<typeof userSeriesPostParamsSchema>;

export const userEpisodePostParamsSchema = z.object({
  seriesId: z.coerce.number().int().min(1),
  episodeId: z.coerce.number().int().min(1)
});

export const userSeriesGetSchema = z.object({
  seriesId: z.coerce.number().int().min(1).optional(),
  status: userSeriesStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional()
});

export const userSeasonPostParamsSchema = z.object({
  seriesId: z.coerce.number().int().min(1),
  seasonId: z.coerce.number().int().min(1)
});

export const userStatusPostParamsSchema = z.object({
  userId: z.string().min(1)
});

export const userEpisodeDeleteParamsSchema = userEpisodePostParamsSchema;

export const userSeasonDeleteParamsSchema = userSeasonPostParamsSchema;

export const userSeriesGetResponseSchema = z.object({
  items: z.array(
    userSeriesResponseSchema.extend({
      seriesDetails: seriesResponseSchema
    })
  ),
  hasNextPage: z.boolean(),
  nextCursor: z.date().nullable()
});

export const userSeriesPostResponseSchema = userSeriesResponseSchema;

export const userEpisodeFeedItemResponseSchema = z.object({
  userId: z.string(),
  seriesId: z.number().int(),
  status: userSeriesStatusSchema,
  lastWatchedAt: z.date().nullable(),
  seriesName: z.string(),
  seriesPosterPath: z.string().nullable(),
  seriesTmdbId: z.number().int(),
  id: z.number().int(),
  name: z.string(),
  seasonNumber: z.number().int(),
  episodeNumber: z.number().int(),
  airDate: z.date().nullable(),
  stillPath: z.string().nullable(),
  runtime: z.number().int(),
  overview: z.string().nullable(),
  remainingEpisodes: z.number().int().nonnegative()
});

export const userEpisodeFeedGetResponseSchema = z.object({
  WATCHING: z.array(userEpisodeFeedItemResponseSchema),
  PAUSED: z.array(userEpisodeFeedItemResponseSchema),
  DROPPED: z.array(userEpisodeFeedItemResponseSchema)
});

export const userEpisodePostResponseSchema = userEpisodeResponseSchema.extend({
  seriesId: z.number().int(),
  nextEpisode: userEpisodeFeedItemResponseSchema.nullable()
});

export const userEpisodeDeleteResponseSchema = userEpisodeResponseSchema;

export const userSeasonPostResponseSchema = z.array(userEpisodeResponseSchema);

export const userSeasonDeleteResponseSchema = userSeasonPostResponseSchema;

export const userDashboardSummaryGetResponseSchema = z.object({
  totalWatchedMinutes: z.number().int().nonnegative(),
  totalWatchedEpisodes: z.number().int().nonnegative(),
  totalWatchedSeries: z.number().int().nonnegative()
});

export const userStatusPostResponseSchema = z.object({
  updatedCount: z.number().int().nonnegative()
});

export type UserEpisodePostParams = z.infer<typeof userEpisodePostParamsSchema>;

export type UserEpisodeDeleteParams = z.infer<typeof userEpisodeDeleteParamsSchema>;

export type UserSeriesGet = z.infer<typeof userSeriesGetSchema>;

export type UserSeasonPostParams = z.infer<typeof userSeasonPostParamsSchema>;

export type UserSeasonDeleteParams = z.infer<typeof userSeasonDeleteParamsSchema>;

export type UserStatusPostParams = z.infer<typeof userStatusPostParamsSchema>;
