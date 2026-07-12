import { z } from "zod";

export const metadataSeriesSearchSchema = z.object({
  query: z.string().trim().min(2),
  page: z.coerce.number().int().min(1).default(1)
});

export type MetadataSeriesSearch = z.infer<typeof metadataSeriesSearchSchema>;
