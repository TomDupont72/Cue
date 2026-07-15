export type SeriesSearchGetResult = {
  tmdbId: number;
  name: string;
  originalName: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  firstAirDate: string | null;
  popularity: number;
  voteAverage?: number;
};

export type SeriesSearchGetResponse = {
  page: number;
  results: SeriesSearchGetResult[];
  totalPages: number;
  totalResults: number;
};

export type SeriesGetSeries = {
  id: number;
  adult: boolean;
  backdropPath: string | null;
  firstAirDate: string | null;
  tmdbId: number;
  inProduction: boolean;
  lastAirDate: string | null;
  name: string;
  numberOfEpisodes: number;
  numberOfSeasons: number;
  originalLanguage: string;
  originalName: string;
  overview: string | null;
  popularity: number;
  posterPath: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SeriesGetSeason = {
  id: number;
  seriesId: number;
  airDate: string | null;
  name: string;
  overview: string | null;
  tmdbId: number;
  posterPath: string | null;
  seasonNumber: number;
  voteAverage: number;
  createdAt: string;
  updatedAt: string;
};

export type SeriesGetEpisode = {
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
};

export type SeriesGetUserSeries = {
  userId: string;
  seriesId: number;
  status: "PLANNED" | "WATCHING" | "COMPLETED" | "DROPPED" | "PAUSED";
  isFavorite: boolean;
  addedAt: string;
  lastWatchedAt: string;
};

type SeriesGetUserEpisode = {
  userId: string;
  episodeId: number;
  watchedAt: string;
};

export type SeriesGetResponse = {
  series: SeriesGetSeries;
  seasons: SeriesGetSeason[];
  episodes: SeriesGetEpisode[];
  userSeries: SeriesGetUserSeries | null;
  userEpisodes: SeriesGetUserEpisode[];
};

export type SeriesImportPostResponse = {
  series: SeriesGetSeries;
  userSeries: SeriesGetUserSeries | null;
};
