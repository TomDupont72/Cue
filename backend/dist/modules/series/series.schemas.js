import { z } from "zod";
export const seriesImportSchema = z.object({
    tmdbId: z.number().int().min(1)
});
