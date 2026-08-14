// =============================================================================
// DATABASE ROW TYPES
// =============================================================================

import type { SeriesRow } from "@/features/series/types/series.types";
import type { Optional } from "@/lib/types";

export type EpisodeRow = {
  id: number;
  seriesId: number;
  seasonId: number;
  airDate?: string;
  episodeNumber: number;
  name: string;
  overview?: string;
  tmdbId: number;
  stillPath?: string;
  runtime: number;
  seasonNumber: number;
  voteAverge: number;
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
  Pick<SeriesRow, "id" | "name" | "tmdbId">,
  "name" | "tmdbId"
>;
