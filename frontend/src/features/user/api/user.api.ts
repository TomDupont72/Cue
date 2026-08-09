import { getSdkData, sdkRequestOptions, validateRequest } from "@/api/client";
import {
  getUserDashboardSummary,
  getUserEpisodesFeed,
  getUserSeries,
  markUserEpisodeWatched,
  markUserSeasonWatched,
  unmarkUserEpisodeWatched,
  unmarkUserSeasonWatched,
  upsertUserSeries
} from "@/api/generated/cue-api";
import {
  userSeriesGetQuerySchema,
  userEpisodeDeleteParamsSchema,
  userEpisodePostParamsSchema,
  userSeriesPostParamsSchema,
  userSeriesPostBodySchema,
  userSeasonPostParamsSchema,
  userSeasonDeleteParamsSchema
} from "@/features/user/schemas/user.schemas";
import type {
  UserDashboardSummaryGetResponse,
  UserEpisodeDeleteResponse,
  UserEpisodePostResponse,
  UserEpisodesFeedGetResponse,
  UserSeasonDeleteResponse,
  UserSeasonPostResponse,
  UserSeriesGetResponse,
  UserSeriesPostResponse
} from "@/features/user/types/user.types";
import { type UserSeriesStatus } from "@/features/user/constants/userSeriesStatus";

export function userSeriesGet(
  limit: number,
  seriesId?: number,
  status?: UserSeriesStatus,
  cursor?: string
): Promise<UserSeriesGetResponse> {
  const query = validateRequest(userSeriesGetQuerySchema, {
    seriesId,
    status,
    limit,
    cursor
  });

  return getSdkData(
    getUserSeries({
      ...sdkRequestOptions,
      query
    })
  );
}

export function userEpisodePost(
  seriesId: number,
  episodeId: number
): Promise<UserEpisodePostResponse> {
  const path = validateRequest(userEpisodePostParamsSchema, {
    seriesId,
    episodeId
  });

  return getSdkData(
    markUserEpisodeWatched({
      ...sdkRequestOptions,
      path
    })
  );
}

export function userSeriesPost(
  seriesId: number,
  status?: UserSeriesStatus,
  isFavorite?: boolean
): Promise<UserSeriesPostResponse> {
  const path = validateRequest(userSeriesPostParamsSchema, {
    seriesId
  });
  const body = validateRequest(userSeriesPostBodySchema, {
    status,
    isFavorite
  });

  return getSdkData(
    upsertUserSeries({
      ...sdkRequestOptions,
      path,
      body
    })
  );
}

export function userEpisodeDelete(
  seriesId: number,
  episodeId: number
): Promise<UserEpisodeDeleteResponse> {
  const path = validateRequest(userEpisodeDeleteParamsSchema, {
    seriesId,
    episodeId
  });

  return getSdkData(
    unmarkUserEpisodeWatched({
      ...sdkRequestOptions,
      path
    })
  );
}

export function userDashboardSummaryGet(): Promise<UserDashboardSummaryGetResponse> {
  return getSdkData(getUserDashboardSummary(sdkRequestOptions));
}

export function userSeasonPost(
  seriesId: number,
  seasonId: number
): Promise<UserSeasonPostResponse> {
  const path = validateRequest(userSeasonPostParamsSchema, {
    seriesId,
    seasonId
  });

  return getSdkData(
    markUserSeasonWatched({
      ...sdkRequestOptions,
      path
    })
  );
}

export function userSeasonDelete(
  seriesId: number,
  seasonId: number
): Promise<UserSeasonDeleteResponse> {
  const path = validateRequest(userSeasonDeleteParamsSchema, {
    seriesId,
    seasonId
  });

  return getSdkData(
    unmarkUserSeasonWatched({
      ...sdkRequestOptions,
      path
    })
  );
}

export function userEpisodesFeedGet(): Promise<UserEpisodesFeedGetResponse> {
  return getSdkData(getUserEpisodesFeed(sdkRequestOptions));
}
