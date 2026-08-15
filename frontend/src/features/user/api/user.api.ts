import { ApiClient } from "@/api/client";
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
  return ApiClient("/user/series", {
    query: {
      ...(seriesId && { seriesId }),
      ...(status && { status }),
      limit,
      ...(cursor && { cursor })
    },
    querySchema: userSeriesGetQuerySchema
  });
}

export function userEpisodePost(
  seriesId: number,
  episodeId: number
): Promise<UserEpisodePostResponse> {
  return ApiClient("/user/series/:seriesId/episode/:episodeId", {
    method: "POST",
    params: {
      seriesId,
      episodeId
    },
    paramsSchema: userEpisodePostParamsSchema
  });
}

export function userSeriesPost(
  seriesId: number,
  status?: UserSeriesStatus,
  isFavorite?: boolean
): Promise<UserSeriesPostResponse> {
  return ApiClient("/user/series/:seriesId", {
    method: "POST",
    params: {
      seriesId
    },
    body: {
      status,
      isFavorite
    },
    paramsSchema: userSeriesPostParamsSchema,
    bodySchema: userSeriesPostBodySchema
  });
}

export function userEpisodeDelete(
  seriesId: number,
  episodeId: number
): Promise<UserEpisodeDeleteResponse> {
  return ApiClient("/user/series/:seriesId/episode/:episodeId", {
    method: "DELETE",
    params: {
      seriesId,
      episodeId
    },
    paramsSchema: userEpisodeDeleteParamsSchema
  });
}

export function userDashboardSummaryGet(): Promise<UserDashboardSummaryGetResponse> {
  return ApiClient("/user/dashboard/summary");
}

export function userSeasonPost(
  seriesId: number,
  seasonId: number
): Promise<UserSeasonPostResponse> {
  return ApiClient("/user/series/:seriesId/season/:seasonId", {
    method: "POST",
    params: {
      seriesId,
      seasonId
    },
    paramsSchema: userSeasonPostParamsSchema
  });
}

export function userSeasonDelete(
  seriesId: number,
  seasonId: number
): Promise<UserSeasonDeleteResponse> {
  return ApiClient("/user/series/:seriesId/season/:seasonId", {
    method: "DELETE",
    params: {
      seriesId,
      seasonId
    },
    paramsSchema: userSeasonDeleteParamsSchema
  });
}

export function userEpisodesFeedGet(): Promise<UserEpisodesFeedGetResponse> {
  return ApiClient("/user/episodes/feed");
}
