// =============================================================================
// DATABASE ROW TYPES
// =============================================================================

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


export type EpisodeCardEpisode = {
  id: number;
  airDate: string | null;
  episodeNumber: number;
  name: string;
  overview?: string | null;
  stillPath: string | null;
  seasonNumber: number;
};

export type EpisodeCardSeries = {
  id: number;
  name?: string;
  tmdbId?: number;
};
