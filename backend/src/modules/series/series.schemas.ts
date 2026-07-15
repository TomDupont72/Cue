import { z } from "zod";

export const seriesImportPostSchema = z.object({
  tmdbId: z.number().int().min(1)
});

export type SeriesImportPost = z.infer<typeof seriesImportPostSchema>;

export const seriesGetSchema = z.object({
  id: z.coerce.number().int().min(1)
});

export type SeriesGet = z.infer<typeof seriesGetSchema>;
