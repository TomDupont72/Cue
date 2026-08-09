import { z } from "zod";

export const SERIES_SEARCH_QUERY_MIN_LENGTH = 2;
export const SERIES_SEARCH_QUERY_MAX_LENGTH = 100;

const positiveIntegerSchema = z
  .union([z.number(), z.string().trim().regex(/^\d+$/)])
  .transform((value) => Number(value))
  .pipe(z.number().int().positive());

export const seriesSearchQuerySchema = z
  .string()
  .trim()
  .min(
    SERIES_SEARCH_QUERY_MIN_LENGTH,
    `La recherche doit contenir au moins ${SERIES_SEARCH_QUERY_MIN_LENGTH} caractères`
  )
  .max(SERIES_SEARCH_QUERY_MAX_LENGTH, "La recherche est trop longue");

export const seriesSearchPageSchema = positiveIntegerSchema.default(1);

export const seriesSearchGetParamsSchema = z.object({
  query: seriesSearchQuerySchema,
  page: seriesSearchPageSchema
});

export type SeriesSearchParams = z.infer<typeof seriesSearchGetParamsSchema>;

export const seriesGetParamsSchema = z.object({
  id: positiveIntegerSchema
});

export type SeriesGetParams = z.infer<typeof seriesGetParamsSchema>;

export const seriesImportPostBodySchema = z.object({
  tmdbId: positiveIntegerSchema
});

export type SeriesImportPostBody = z.infer<typeof seriesImportPostBodySchema>;
