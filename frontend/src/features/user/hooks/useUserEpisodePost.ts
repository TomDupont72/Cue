import type { UserEpisodePostParams } from "../schemas/user.schemas";
import { userEpisodePost } from "../api/user.api";
import { queryKeys } from "@/lib/queryKeys";
import type { SeriesGetResponse } from "@/features/series/types/series.types";
import type { UserEpisodePostResponse } from "../types/user.types";
import { useOptimisticMutation } from "@/lib/useOptimisticMutation";
import { userCachePolicy } from "../cache/userCachePolicy";

export function useUserEpisodePost() {
  return useOptimisticMutation<
    UserEpisodePostResponse,
    Error,
    UserEpisodePostParams,
    void,
    SeriesGetResponse
  >({
    mutationFn: ({ seriesId, episodeId }) => userEpisodePost(seriesId, episodeId),

    getOptimisticQueryKey: ({ seriesId }) => queryKeys.series.detail(seriesId),

    getInvalidationFilters: ({ seriesId }) => userCachePolicy.episodeAdded(seriesId),

    updateCache: (currentData, { episodeId }) => {
      const alreadyWatched = currentData.userEpisodes.some((item) => item.episodeId === episodeId);

      if (alreadyWatched) {
        return currentData;
      }

      return {
        ...currentData,
        userEpisodes: [
          ...currentData.userEpisodes,
          {
            userId: "optimistic",
            episodeId,
            watchedAt: new Date().toISOString()
          }
        ]
      };
    }
  });
}
