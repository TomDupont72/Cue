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
