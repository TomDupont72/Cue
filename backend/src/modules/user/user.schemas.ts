import z from "zod";

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

export const userSeriesGetParamsSchema = z.object({
  seriesId: z.coerce.number().int().min(1).optional(),
  status: userSeriesStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional()
});

export const userSeasonPostParamsSchema = z.object({
  seriesId: z.coerce.number().int().min(1),
  seasonId: z.coerce.number().int().min(1)
});

export const userEpisodeDeleteParamsSchema = userEpisodePostParamsSchema;

export const userSeasonDeleteParamsSchema = userSeasonPostParamsSchema;

export type UserEpisodePostParams = z.infer<typeof userEpisodePostParamsSchema>;

export type UserEpisodeDeleteParams = z.infer<typeof userEpisodeDeleteParamsSchema>;

export type UserSeriesGetParams = z.infer<typeof userSeriesGetParamsSchema>;

export type UserSeasonPostParams = z.infer<typeof userSeasonPostParamsSchema>;

export type UserSeasonDeleteParams = z.infer<typeof userSeasonDeleteParamsSchema>;
