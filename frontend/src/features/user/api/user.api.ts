import { apiClient } from "@/api/client";
import {
  userSeriesGetQuerySchema,
  userEpisodeDeleteParamsSchema,
  userEpisodePostParamsSchema
} from "../schemas/user.schemas";
import type {
  userDashboardSummaryGetResponse,
  UserEpisodeDeleteResponse,
  UserEpisodePostResponse,
  UserSeriesGetResponse
} from "../types/user.types";
import { type UserSeriesStatus } from "../constants/userSeriesStatus";

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

export function userDashboardSummaryGet(): Promise<userDashboardSummaryGetResponse> {
  return apiClient("/user/dashboard/summary");
}
