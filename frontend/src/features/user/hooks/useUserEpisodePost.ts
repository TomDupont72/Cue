import type { SeriesGetResponse } from "@/features/series/types/series.types";
import type { UserEpisodePostParams } from "@/features/user/schemas/user.schemas";
import type { UserEpisodePostResponse } from "@/features/user/types/user.types";

import { userEpisodePost } from "@/features/user/api/user.api";
import { userCachePolicy } from "@/features/user/cache/userCachePolicy";
import { queryKeys } from "@/lib/queryKeys";
import { useOptimisticMutation } from "@/lib/useOptimisticMutation";

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
