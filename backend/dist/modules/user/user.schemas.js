import z from "zod";
export const userSeriesStatuses = [
    "PLANNED",
    "WATCHING",
    "COMPLETED",
    "DROPPED",
    "PAUSED"
];
export const userSeriesPostBodySchema = z.object({
    status: z.enum(userSeriesStatuses).optional(),
    isFavorite: z.boolean().optional()
});
export const userSeriesPostParamsSchema = z.object({
    seriesId: z.coerce.number().int().min(1)
});
export const userEpisodePostParamsSchema = z.object({
    seriesId: z.coerce.number().int().min(1),
    episodeId: z.coerce.number().int().min(1)
});
export const userEpisodeDeleteParamsSchema = userEpisodePostParamsSchema;
