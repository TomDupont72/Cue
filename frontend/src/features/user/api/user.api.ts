import { apiClient } from "@/api/client";
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
  return apiClient("/user/series", {
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
  return apiClient("/user/series/:seriesId/episode/:episodeId", {
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
  return apiClient("/user/series/:seriesId", {
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
  return apiClient("/user/series/:seriesId/episode/:episodeId", {
    method: "DELETE",
    params: {
      seriesId,
      episodeId
    },
    paramsSchema: userEpisodeDeleteParamsSchema
  });
}

export function userDashboardSummaryGet(): Promise<UserDashboardSummaryGetResponse> {
  return apiClient("/user/dashboard/summary");
}

export function userSeasonPost(
  seriesId: number,
  seasonId: number
): Promise<UserSeasonPostResponse> {
  return apiClient("/user/series/:seriesId/season/:seasonId", {
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
  return apiClient("/user/series/:seriesId/season/:seasonId", {
    method: "DELETE",
    params: {
      seriesId,
      seasonId
    },
    paramsSchema: userSeasonDeleteParamsSchema
  });
}
