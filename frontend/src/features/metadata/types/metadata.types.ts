import type { SeriesRow } from "@/features/series/types/series.types";

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export type MetadataSeriesSearchGetResponse = {
  page: number;
  results: Pick<
    SeriesRow,
    | "tmdbId"
    | "name"
    | "originalName"
    | "overview"
    | "posterPath"
    | "backdropPath"
    | "firstAirDate"
    | "originalLanguage"
  > & {
    voteAverage: number;
  };
  totalPages: number;
  totalResults: number;
};
