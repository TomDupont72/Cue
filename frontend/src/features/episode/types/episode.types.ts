// =============================================================================
// DATABASE ROW TYPES
// =============================================================================

import type { SeriesRow } from "@/features/series/types/series.types";
import type { Optional } from "@/lib/types";

export type EpisodeRow = {
  id: number;
  seriesId: number;
  seasonId: number;
  airDate: string | null;
  episodeNumber: number;
  name: string;
  overview: string | null;
  tmdbId: number;
  stillPath: string | null;
  runtime: number;
  seasonNumber: number;
  voteAverage: number;
  createdAt: string;
  updatedAt: string;
};

// =============================================================================
// COMPONENT TYPES
// =============================================================================

export type EpisodeCardEpisode = Pick<
  EpisodeRow,
  "id" | "airDate" | "episodeNumber" | "name" | "overview" | "stillPath" | "seasonNumber"
>;

export type EpisodeCardSeries = Optional<
  Pick<SeriesRow, "id" | "name" | "tmdbId" | "posterPath">,
  "name" | "tmdbId"
>;
