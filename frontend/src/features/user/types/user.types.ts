import type { SeriesRow } from "@/features/series/types/series.types";
import { USER_SERIES_STATUS, type UserSeriesStatus } from "../constants/userSeriesStatus";
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
  watchedEpisodeCount: number;
  addedAt: string;
  lastWatchedAt: string | null;
};

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export type UserEpisodePostResponse = UserEpisodeRow & {
  seriesId: number;
  nextEpisode:
    | (Omit<UserSeriesRow, "isFavorite" | "watchCount" | "watchedEpisodeCount" | "addedAt"> &
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
  [USER_SERIES_STATUS.WATCHING]: T[];
  [USER_SERIES_STATUS.PAUSED]: T[];
  [USER_SERIES_STATUS.DROPPED]: T[];
};

export type UserEpisodesFeedGetResponse = UserEpisodesFeed<
  Omit<UserSeriesRow, "isFavorite" | "watchCount" | "watchedEpisodeCount" | "addedAt"> &
    Omit<EpisodeRow, "seasonId" | "tmdbId" | "voteAverage" | "createdAt" | "updatedAt"> & {
      seriesName: string;
      seriesPosterPath: string | null;
      seriesTmdbId: number;
      remainingEpisodes: number;
    }
>;

export type UserEpisodesUpcomingGetResponse = {
  episodes: (Pick<
    EpisodeRow,
    | "id"
    | "name"
    | "seasonNumber"
    | "episodeNumber"
    | "airDate"
    | "stillPath"
    | "runtime"
    | "overview"
  > & {
    seriesId: number;
    seriesName: string;
    seriesPosterPath: string | null;
  })[];
};

// =============================================================================
// COMPONENT TYPES
// =============================================================================

export type WatchSectionStatus = Extract<UserSeriesStatus, "WATCHING" | "PAUSED" | "DROPPED">;

export type WatchSectionItem = Omit<
  EpisodeRow,
  "seasonId" | "tmdbId" | "voteAverage" | "createdAt" | "updatedAt"
> & {
  seriesName: string;
  seriesPosterPath: string | null;
};
