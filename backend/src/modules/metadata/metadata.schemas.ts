import { z } from "zod";

const metadataSeriesSearchGetResultSchema = z.object({
  tmdbId: z.number().int(),
  name: z.string(),
  originalName: z.string(),
  overview: z.string().nullable(),
  posterPath: z.string().nullable(),
  backdropPath: z.string().nullable(),
  firstAirDate: z.string().nullable(),
  originalLanguage: z.string(),
  voteAverage: z.number()
});

export const metadataSeriesSearchGetResponseSchema = z.object({
  page: z.number().int(),
  results: z.array(metadataSeriesSearchGetResultSchema),
  totalPages: z.number().int(),
  totalResults: z.number().int()
});

const metadataSeriesChangesGetResultSchema = z.object({
  tmdbId: z.number().int()
});

export const metadataSeriesChangesGetResponseSchema = z.object({
  results: z.array(metadataSeriesChangesGetResultSchema),
  page: z.number().int(),
  totalPages: z.number().int(),
  totalResults: z.number().int()
});

export const metadataSeriesSearchGetSchema = z.object({
  query: z.string().trim().min(2),
  page: z.coerce.number().int().min(1).default(1)
});

export const metadataSeriesChangesGetSchema = z
  .object({
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    page: z.coerce.number().int().min(1)
  })
  .refine(({ startDate, endDate }) => startDate <= endDate, {
    message: "endDate must be greater than or equal to startDate",
    path: ["endDate"]
  });

export type MetadataSeriesSearchGet = z.infer<typeof metadataSeriesSearchGetSchema>;

export type MetadataSeriesChangesGet = z.infer<typeof metadataSeriesChangesGetSchema>;
