import type { SeriesSearchGetResult } from "@/features/series/types/series.types";
import type { UserSeriesStatus } from "../constants/userSeriesStatus";

export type UserEpisodePostResponse = {
  userId: string;
  episodeId: number;
  watchedAt: string;
  seriesId: number;
  nextEpisode: UserEpisodesFeedGetItem | null;
};

export type UserSeriesPostResponse = {
  userId: string;
  seriesId: number;
  status: UserSeriesStatus;
  isFavorite: boolean;
  watchCount: number;
  addedAt: string;
  lastWatchedAt: string | null;
};

export type UserEpisodeDeleteResponse = {
  userId: string;
  episodeId: number;
  watchedAt: string;
};

type UserSeriesGetItems = {
  seriesDetails: SeriesSearchGetResult;
  userId: string;
  seriesId: number;
  status: UserSeriesStatus;
  isFavorite: boolean;
  addedAt: string;
  lastWatchedAt: string | null;
  watchCount: number;
};

export type UserSeriesGetResponse = {
  items: UserSeriesGetItems[];
  hasNextPage: boolean;
  nextCursor: string | null;
};

export type UserDashboardSummaryGetResponse = {
  totalWatchedMinutes: number;
  totalWatchedEpisodes: number;
  totalWatchedSeries: number;
};

export type UserSeasonPostResponse = {
  userId: string;
  episodeId: number;
  watchedAt: string;
}[];

export type UserSeasonDeleteResponse = UserSeasonPostResponse;

export type UserEpisodesFeedGetItem = {
  userId: string;
  seriesId: number;
  status: UserSeriesStatus;
  lastWatchedAt: string | null;

  seriesName: string;
  seriesPosterPath: string | null;
  seriesTmdbId: number;

  id: number;
  name: string;
  seasonNumber: number;
  episodeNumber: number;
  airDate: string | null;
  stillPath: string | null;
  runtime: number;
  overview: string | null;
  remainingEpisodes: number;
};

export type UserEpisodesFeedGetResponse = {
  watching: UserEpisodesFeedGetItem[];
  paused: UserEpisodesFeedGetItem[];
  dropped: UserEpisodesFeedGetItem[];
};
