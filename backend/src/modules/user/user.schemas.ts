import z from "zod";

import { episodeRowSchema } from "@/modules/episode/episode.db.schemas.js";
import { genreRowSchema } from "@/modules/genre/genre.db.schemas.js";
import { providerRowSchema } from "@/modules/provider/provider.db.schemas.js";
import { seriesRowSchema } from "@/modules/series/series.db.schemas.js";
import { userEpisodeRowSchema, userSeriesRowSchema } from "@/modules/user/user.db.schemas.js";

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

export const userEpisodePostResponseSchema = userEpisodeRowSchema;

export const userEpisodeDeleteResponseSchema = userEpisodeRowSchema;

export const userSeasonPostResponseSchema = z.array(userEpisodeRowSchema);

export const userSeasonDeleteResponseSchema = z.array(userEpisodeRowSchema);

export const userSeriesGetResponseSchema = z.object({
  series: z.array(
    userSeriesRowSchema.extend({
      seriesDetails: seriesRowSchema,
      seriesProviders: z.array(providerRowSchema),
      seriesGenres: z.array(genreRowSchema),
      watchedMinutes: z.number().int().min(0),
      remainingReleasedMinutes: z.number().int().min(0)
    })
  )
});

export const userSeriesPostResponseSchema = userSeriesRowSchema;

export const userDashboardSummaryGetResponseSchema = z.object({
  totalWatchedMinutes: z.number().int().nonnegative(),
  totalWatchedEpisodes: z.number().int().nonnegative(),
  totalWatchedSeries: z.number().int().nonnegative()
});

export const userEpisodeFeedItemResponseSchema = episodeRowSchema.extend({
  seriesName: seriesRowSchema.shape.name,
  seriesBackdropPath: seriesRowSchema.shape.name,
  status: userSeriesRowSchema.shape.status
});

export const userEpisodeFeedGetResponseSchema = z.object({
  WATCHING: z.array(userEpisodeFeedItemResponseSchema),
  PAUSED: z.array(userEpisodeFeedItemResponseSchema),
  DROPPED: z.array(userEpisodeFeedItemResponseSchema)
});

export const userEpisodeUpcomingItemResponseSchema = episodeRowSchema.extend({
  seriesName: z.string(),
  seriesBackdropPath: z.string().nullable()
});

export const userEpisodeUpcomingGetResponseSchema = z.object({
  episodes: z.array(userEpisodeUpcomingItemResponseSchema)
});

export const userSeriesReconcilePostResponseSchema = z.object({
  updatedCount: z.number().int().nonnegative()
});

// =============================================================================
// API PARAMS SCHEMAS
// =============================================================================

export const userEpisodePostParamsSchema = z.object({
  seriesId: z.coerce.number().int().min(1),
  episodeId: z.coerce.number().int().min(1)
});

export type UserEpisodePostParams = z.infer<typeof userEpisodePostParamsSchema>;

export const userEpisodeDeleteParamsSchema = userEpisodePostParamsSchema;

export type UserEpisodeDeleteParams = z.infer<typeof userEpisodeDeleteParamsSchema>;

export const userSeasonPostParamsSchema = z.object({
  seriesId: z.coerce.number().int().min(1),
  seasonId: z.coerce.number().int().min(1)
});

export type UserSeasonPostParams = z.infer<typeof userSeasonPostParamsSchema>;

export const userSeasonDeleteParamsSchema = userSeasonPostParamsSchema;

export type UserSeasonDeleteParams = z.infer<typeof userSeasonDeleteParamsSchema>;

export const userSeriesGetParamsSchema = z.object({
  seriesId: z.coerce.number().int().min(1).optional()
});

export type UserSeriesGetParams = z.infer<typeof userSeriesGetParamsSchema>;

export const userSeriesPostParamsSchema = z.object({
  seriesId: z.coerce.number().int().min(1)
});

export type UserSeriesPostParams = z.infer<typeof userSeriesPostParamsSchema>;

export const userSeriesReconcilePostParamsSchema = z.object({
  userId: z.string().min(1)
});

export type UserSeriesReconcilePostParams = z.infer<typeof userSeriesReconcilePostParamsSchema>;

// =============================================================================
// API BODY SCHEMAS
// =============================================================================

export const userSeriesPostBodySchema = z.preprocess(
  (value) => (value === null || value === undefined ? {} : value),
  z.object({
    isFavorite: z.boolean().optional()
  })
);

export type UserSeriesPostBody = z.infer<typeof userSeriesPostBodySchema>;
