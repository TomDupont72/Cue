import { UserSeriesStatus } from "@/generated/prisma/enums.js";

export type EpisodeFeedRow = {
  userId: string;
  seriesId: number;
  status: UserSeriesStatus;
  lastWatchedAt: Date | null;

  seriesName: string;
  seriesPosterPath: string | null;
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
