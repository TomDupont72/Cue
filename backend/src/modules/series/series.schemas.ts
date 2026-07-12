import { z } from "zod";

export const seriesImportSchema = z.object({
  tmdbId: z.number().int().min(1)
});

export type SeriesImport = z.infer<typeof seriesImportSchema>;
