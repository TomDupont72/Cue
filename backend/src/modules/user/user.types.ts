import { UserSeriesStatus } from "@/generated/prisma/enums.js";

export type EpisodeFeedRow = {
  userId: string;
  seriesId: number;
  status: UserSeriesStatus;
  lastWatchedAt: Date | null;

  seriesName: string;
  seriesBackdropPath: string | null;
  seriesTmdbId: number;

  id: number;
  name: string;
  seasonNumber: number;
  episodeNumber: number;
  airDate: Date | null;
  stillPath: string | null;
  runtime: number;
  overview: string | null;
  remainingEpisodes: number;
};

export type UserSeriesUpdate = {
  isFavorite?: boolean;
  status?: UserSeriesStatus;
  watchCount?: number;
  watchedEpisodeCount?: number;
  lastWatchedAt?: Date | null;
};

export type UserUpcomingEpisodeRow = {
  id: number;
  seriesId: number;
  seasonId: number;
  airDate: string | null;
  episodeNumber: number;
  name: string;
  overview: string | null;
  tmdbId: number;
  stillPath: string | null;
  runtime: number;
  seasonNumber: number;
  voteAverage: number;
  createdAt: string;
  updatedAt: string;
  seriesName: string;
  seriesBackdropPath: string;
};
