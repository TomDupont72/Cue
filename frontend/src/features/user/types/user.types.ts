import type {
  GetUserDashboardSummaryResponse,
  GetUserEpisodesFeedResponse,
  GetUserSeriesResponse,
  MarkUserEpisodeWatchedResponse,
  MarkUserSeasonWatchedResponse,
  UnmarkUserEpisodeWatchedResponse,
  UnmarkUserSeasonWatchedResponse,
  UpsertUserSeriesResponse,
  UserEpisodeFeedItem
} from "@/api/generated/cue-api";

export type UserEpisodePostResponse = MarkUserEpisodeWatchedResponse;

export type UserSeriesPostResponse = UpsertUserSeriesResponse;

export type UserEpisodeDeleteResponse = UnmarkUserEpisodeWatchedResponse;

export type UserSeriesGetResponse = GetUserSeriesResponse;

export type UserDashboardSummaryGetResponse = GetUserDashboardSummaryResponse;

export type UserSeasonPostResponse = MarkUserSeasonWatchedResponse;

export type UserSeasonDeleteResponse = UnmarkUserSeasonWatchedResponse;

export type UserEpisodesFeedGetItem = UserEpisodeFeedItem;

export type UserEpisodesFeedGetResponse = GetUserEpisodesFeedResponse;
