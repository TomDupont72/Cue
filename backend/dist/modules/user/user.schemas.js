import z from "zod";
export const userSeriesStatuses = [
    "PLANNED",
    "WATCHING",
    "COMPLETED",
    "DROPPED",
    "PAUSED"
];
export const userSeriesStatusSchema = z.enum(userSeriesStatuses);
export const userSeriesPostBodySchema = z.object({
    status: userSeriesStatusSchema.optional(),
    isFavorite: z.boolean().optional()
});
export const userSeriesPostParamsSchema = z.object({
    seriesId: z.coerce.number().int().min(1)
});
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
export const userStatusRecalculateSchema = z.object({
    userId: z.string().min(1)
});
export const userEpisodeDeleteParamsSchema = userEpisodePostParamsSchema;
export const userSeasonDeleteParamsSchema = userSeasonPostParamsSchema;
