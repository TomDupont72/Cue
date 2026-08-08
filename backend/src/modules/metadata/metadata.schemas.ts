import { z } from "zod";

const metadataSeriesSearchResultSchema = z.object({
  tmdbId: z.number().int(),
  name: z.string(),
  originalName: z.string(),
  overview: z.string(),
  posterPath: z.string().nullable(),
  backdropPath: z.string().nullable(),
  firstAirDate: z.string().nullable(),
  originalLanguage: z.string(),
  voteAverage: z.number()
});

export const metadataSeriesSearchResponseSchema = z.object({
  page: z.number().int(),
  results: z.array(metadataSeriesSearchResultSchema),
  totalPages: z.number().int(),
  totalResults: z.number().int()
});

const metadataSeriesChangesResultSchema = z.object({
  tmdbId: z.number().int()
});

export const metadataSeriesChangesResponseSchema = z.object({
  results: z.array(metadataSeriesChangesResultSchema),
  page: z.number().int(),
  totalPages: z.number().int(),
  totalResults: z.number().int()
});

export const metadataSeriesSearchSchema = z.object({
  query: z.string().trim().min(2),
  page: z.coerce.number().int().min(1).default(1)
});

export const metadataSeriesChangesSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  page: z.coerce.number().int().min(1)
});

export type MetadataSeriesSearch = z.infer<typeof metadataSeriesSearchSchema>;

export type MetadataSeriesChanges = z.infer<typeof metadataSeriesChangesSchema>;
