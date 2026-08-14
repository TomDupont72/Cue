// =============================================================================
// DATABASE ROW TYPES
// =============================================================================

import type { EpisodeRow } from "@/features/episode/types/episode.types";

export type SeasonRow = {
  id: number;
  seriesId: number;
  airDate?: string;
  name: string;
  overview?: string;
  tmdbId: number;
  posterPath?: string;
  seasonNumber: number;
  voteAverage: number;
  createdAt: string;
  updatedAt: string;
};

// =============================================================================
// COMPONENT TYPES
// =============================================================================

export type SeasonCardSeason = Pick<SeasonRow, "id" | "seasonNumber">;

export type SeasonCardEpisode = Pick<
  EpisodeRow,
  "id" | "airDate" | "name" | "episodeNumber" | "seasonNumber"
>;
