import { z } from "zod";

export const seriesSearchGetParamsSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, "La recherche doit contenir au moins 2 caractères")
    .max(100, "La recherche est trop longue"),

  page: z.coerce.number().int().min(1).default(1)
});

export type SeriesSearchParams = z.infer<typeof seriesSearchGetParamsSchema>;

export const seriesGetParamsSchema = z.object({
  id: z.coerce.number().min(1)
});

export type SeriesGetParams = z.infer<typeof seriesGetParamsSchema>;

export const seriesImportPostBodySchema = z.object({
  tmdbId: z.coerce.number().min(1)
});

export type SeriesImportPostBody = z.infer<typeof seriesImportPostBodySchema>;
