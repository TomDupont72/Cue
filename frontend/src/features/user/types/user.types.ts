import type { SeriesRow } from "@/features/series/types/series.types";
import type { UserSeriesStatus } from "../constants/userSeriesStatus";
import type { EpisodeRow } from "@/features/episode/types/episode.types";

// =============================================================================
// DATABASE ROW TYPES
// =============================================================================

export type UserEpisodeRow = {
  userId: string;
  episodeId: number;
  watchedAt: string;
};

export type UserSeriesRow = {
  userId: string;
  seriesId: number;
  status: UserSeriesStatus;
  isFavorite: boolean;
  watchCount: number;
  addedAt: string;
  lastWatchedAt: string | null;
};

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export type UserEpisodePostResponse = UserEpisodeRow & {
  seriesId: number;
  nextEpisode:
    | (Omit<UserSeriesRow, "isFavorite" | "watchCount" | "addedAt"> &
        Omit<EpisodeRow, "seasonId" | "tmdbId" | "voteAverage" | "createdAt" | "updatedAt"> & {
          seriesName: string;
          seriesPosterPath: string | null;
          seriesTmdbId: number;
          remainingEpisodes: number;
        })
    | null;
};

export type UserEpisodeDeleteResponse = UserEpisodeRow;

export type UserSeasonPostResponse = UserEpisodeRow[];

export type UserSeasonDeleteResponse = UserEpisodeRow[];

export type UserSeriesGetResponse = {
  items: (UserSeriesRow & {
    seriesDetails: SeriesRow;
  })[];
  hasNextPage: boolean;
  nextCursor: string | null;
};

export type UserSeriesPostResponse = UserSeriesRow;

export type UserDashboardSummaryGetResponse = {
  totalWatchedMinutes: number;
  totalWatchedEpisodes: number;
  totalWatchedSeries: number;
};

export type UserEpisodesFeed<T> = {
  watching: T[];
  paused: T[];
  dropped: T[];
};

export type UserEpisodesFeedGetResponse = UserEpisodesFeed<
  Omit<UserSeriesRow, "isFavorite" | "watchCount" | "addedAt"> &
    Omit<EpisodeRow, "seasonId" | "tmdbId" | "voteAverage" | "createdAt" | "updatedAt"> & {
      seriesName: string;
      seriesPosterPath: string | null;
      seriesTmdbId: number;
      remainingEpisodes: number;
    }
>;
