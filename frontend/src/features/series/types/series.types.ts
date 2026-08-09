import type {
  Episode,
  GetSeriesResponse,
  ImportSeriesResponse,
  MetadataSeriesSearchResult,
  SearchMetadataSeriesResponse,
  Season,
  Series,
  UserSeries
} from "@/api/generated/cue-api";

export type SeriesCardData = {
  tmdbId: number;
  name: string;
  posterPath: string | null;
  firstAirDate: string | null;
};

export type SeriesSearchGetResult = MetadataSeriesSearchResult;

export type SeriesSearchGetResponse = SearchMetadataSeriesResponse;

export type SeriesGetSeries = Series;

export type SeriesGetSeason = Season;

export type SeriesGetEpisode = Episode;

export type SeriesGetUserSeries = UserSeries;

export type SeriesGetResponse = GetSeriesResponse;

export type SeriesImportPostResponse = ImportSeriesResponse;
