import { z } from "zod";
export const seriesImportPostSchema = z.object({
    tmdbId: z.number().int().min(1)
});
export const seriesGetSchema = z.object({
    id: z.coerce.number().int().min(1)
});
