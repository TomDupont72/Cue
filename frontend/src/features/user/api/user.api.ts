import { apiClient } from "@/api/client";
import { userEpisodePostParamsSchema } from "../schemas/user.schemas";
import type { UserEpisodePostResponse } from "../types/user.types";

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
