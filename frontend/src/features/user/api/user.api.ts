import { apiClient } from "@/api/client";
import {
  userEpisodeDeleteParamsSchema,
  userEpisodePostParamsSchema
} from "../schemas/user.schemas";
import type { UserEpisodeDeleteResponse, UserEpisodePostResponse } from "../types/user.types";

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
