import type { SeriesSearchGetResult } from "@/features/series/types/series.types";
import type { UserSeriesStatus } from "../constants/userSeriesStatus";

export type UserEpisodePostResponse = {
  userId: string;
  episodeId: number;
  watchedAt: string;
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

export type UserEpisodeDeleteResponse = UserEpisodePostResponse;

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
