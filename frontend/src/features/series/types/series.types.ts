export type SeriesSearchResult = {
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

export type SeriesSearchResponse = {
  page: number;
  results: SeriesSearchResult[];
  totalPages: number;
  totalResults: number;
};
