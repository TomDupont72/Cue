import { z } from "zod";

const metadataSeriesSearchResultSchema = z
  .object({
    tmdbId: z.number().int(),
    name: z.string(),
    originalName: z.string(),
    overview: z.string(),
    posterPath: z.string().nullable(),
    backdropPath: z.string().nullable(),
    firstAirDate: z.string().nullable(),
    originalLanguage: z.string(),
    voteAverage: z.number()
  })
  .meta({ id: "MetadataSeriesSearchResult" });

export const metadataSeriesSearchResponseSchema = z
  .object({
    page: z.number().int(),
    results: z.array(metadataSeriesSearchResultSchema),
    totalPages: z.number().int(),
    totalResults: z.number().int()
  })
  .meta({ id: "MetadataSeriesSearchResponse" });

const metadataSeriesChangesResultSchema = z
  .object({
    tmdbId: z.number().int()
  })
  .meta({ id: "MetadataSeriesChangesResult" });

export const metadataSeriesChangesResponseSchema = z
  .object({
    results: z.array(metadataSeriesChangesResultSchema),
    page: z.number().int(),
    totalPages: z.number().int(),
    totalResults: z.number().int()
  })
  .meta({ id: "MetadataSeriesChangesResponse" });

export const metadataSeriesSearchSchema = z.object({
  query: z.string().trim().min(2),
  page: z.coerce.number().int().min(1).default(1)
});

export const metadataSeriesChangesSchema = z.object({
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  page: z.coerce.number().int().min(1)
});

export type MetadataSeriesSearch = z.infer<typeof metadataSeriesSearchSchema>;

export type MetadataSeriesChanges = z.infer<typeof metadataSeriesChangesSchema>;

export type MetadataSeriesSearchResponse = z.output<typeof metadataSeriesSearchResponseSchema>;

export type MetadataSeriesChangesResponse = z.output<typeof metadataSeriesChangesResponseSchema>;
