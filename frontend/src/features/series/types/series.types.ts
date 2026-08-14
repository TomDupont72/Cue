import type { EpisodeRow } from "@/features/episode/types/episode.types";
import type { SeasonRow } from "@/features/season/types/season.types";
import type { UserEpisodeRow, UserSeriesRow } from "@/features/user/types/user.types";
import type { Optional } from "@/lib/types";

// =============================================================================
// DATABASE ROW TYPES
// =============================================================================

export type SeriesRow = {
  id: number;
  adult: boolean;
  backdropPath?: string;
  firstAirDate?: string;
  tmdbId: number;
  inProduction: boolean;
  lastAirDate?: string;
  name: string;
  numberOfEpisodes: number;
  numberOfSeasons: number;
  originalLanguage: string;
  originalName: string;
  overview?: string;
  popularity: number;
  posterPath?: string;
  createdAt: string;
  updatedAt: string;
};

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export type SeriesGetResponse = {
  series: SeriesRow;
  seasons: SeasonRow[];
  episodes: EpisodeRow[];
  userSeries: UserSeriesRow;
  userEpisodes: UserEpisodeRow[];
};

export type SeriesImportPostResponse = {
  series: SeriesRow;
  userSeries: UserSeriesRow;
};

// =============================================================================
// COMPONENT TYPES
// =============================================================================

export type SeriesCardSeries = Pick<SeriesRow, "tmdbId" | "name" | "posterPath" | "firstAirDate">;

export type SeriesDisplaySeries = Optional<Pick<
  SeriesRow,
  "tmdbId" | "name" | "posterPath" | "firstAirDate" | "numberOfEpisodes"
>, "numberOfEpisodes">;
