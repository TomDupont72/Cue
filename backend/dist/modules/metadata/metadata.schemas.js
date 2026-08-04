import { z } from "zod";
export const metadataSeriesSearchSchema = z.object({
    query: z.string().trim().min(2),
    page: z.coerce.number().int().min(1).default(1)
});
export const metadataSeriesChangesSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    page: z.coerce.number().int().min(1)
});
