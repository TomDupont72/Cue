import { z } from "zod";

export const userSeriesGetQuerySchema = z.object({
  seriesId: z.number().int().min(1).optional()
});

export const userSeriesPostParamsSchema = z.object({
    seriesId: z.number().int().min(1)
});

export const userSeriesPostBodySchema = z.object({
    isFavorite: z.boolean().optional()
});

export const userSeasonPostParamsSchema = z.object({
    seriesId: z.number().int().min(1),
    seasonId: z.number().int().min(1)
});

export const userSeasonDeleteParamsSchema = userSeasonPostParamsSchema;

export const userEpisodesActivityGetParamsSchema = z.object({
  seriesIds: z
    .union([z.array(z.coerce.number().int().min(1)), z.coerce.number().int().min(1)])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .optional(),
  timezone: z.enum(["UTC", ...Intl.supportedValuesOf("timeZone")]).default("UTC")
});

export const userEpisodePostParamsSchema = z.object({
  seriesId: z.number().int().min(1),
  episodeId: z.number().int().min(1)
});

export const userEpisodeDeleteParamsSchema = userEpisodePostParamsSchema;

export type UserSeriesPostParams = z.infer<typeof userSeriesPostParamsSchema>;

export type UserSeriesPostBody = z.infer<typeof userSeriesPostBodySchema>;

export type UserSeasonPostParams = z.infer<typeof userSeasonPostParamsSchema>;

export type UserSeasonDeleteParams = z.infer<typeof userSeasonDeleteParamsSchema>;

export type UserEpisodesActivityGetParams = z.infer<typeof userEpisodesActivityGetParamsSchema>

export type UserEpisodePostParams = z.infer<typeof userEpisodePostParamsSchema>;

export type UserEpisodeDeleteParams = z.infer<typeof userEpisodeDeleteParamsSchema>;