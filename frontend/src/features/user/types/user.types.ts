import type { SeriesSearchGetResult } from "@/features/series/types/series.types";
import type { UserSeriesStatus } from "../constants/userSeriesStatus";

export type UserEpisodePostResponse = {
  userId: string;
  episodeId: number;
  watchedAt: string;
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
};

export type UserSeriesGetResponse = {
  items: UserSeriesGetItems[];
  hasNextPage: boolean;
  nextCursor: string | null;
};

export type userDashboardSummaryGetResponse = {
  totalWatchedMinutes: number;
  totalWatchedEpisodes: number;
};
