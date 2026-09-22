import { z } from "zod";
import { seriesRowSchema } from "./series.db.schemas.js";
import { userEpisodeRowSchema, userSeriesRowSchema } from "../user/user.db.schemas.js";
import { seasonRowSchema } from "../season/season.db.schemas.js";
import { episodeRowSchema } from "../episode/episode.db.schemas.js";

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

export const seriesImportPostResponseSchema = z.object({
  series: seriesRowSchema,
  userSeries: userSeriesRowSchema.nullable()
});

export const seriesGetResponseSchema = z.object({
  series: seriesRowSchema,
  seasons: z.array(seasonRowSchema),
  episodes: z.array(episodeRowSchema),
  userSeries: userSeriesRowSchema.nullable(),
  userEpisodes: z.array(userEpisodeRowSchema)
});

export const seriesImportPostBodySchema = z.object({
  tmdbId: z.number().int().min(1)
});

export const seriesReconcilePostResponseSchema = z.object({
  updatedCount: z.number().int().nonnegative()
});

// =============================================================================
// API PARAMS SCHEMAS
// =============================================================================

export type SeriesGetParams = z.infer<typeof seriesGetParamsSchema>;

// =============================================================================
// API BODY SCHEMAS
// =============================================================================

export type SeriesImportPostBody = z.infer<typeof seriesImportPostBodySchema>;

export const seriesReconcilePostBodySchema = z.object({
  tmdbIds: z.array(z.number().int().min(1))
});

export type SeriesReconcilePostBody = z.infer<typeof seriesReconcilePostBodySchema>;

export const seriesGetParamsSchema = z.object({
  id: z.coerce.number().int().min(1)
});
