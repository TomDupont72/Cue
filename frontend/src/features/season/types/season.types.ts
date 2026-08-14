// =============================================================================
// DATABASE ROW TYPES
// =============================================================================

import type { EpisodeRow } from "@/features/episode/types/episode.types";

export type SeasonRow = {
  id: number;
  seriesId: number;
  airDate: string | null;
  name: string;
  overview: string | null;
  tmdbId: number;
  posterPath: string | null;
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
  "id" | "airDate" | "name" | "episodeNumber" | "seasonNumber" | "stillPath" | "overview"
>;
