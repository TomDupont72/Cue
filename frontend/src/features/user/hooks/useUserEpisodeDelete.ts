import type { SeriesGetResponse } from "@/features/series/types/series.types";
import type { UserEpisodeDeleteParams } from "@/features/user/schemas/user.schemas";
import type { UserEpisodeDeleteResponse } from "@/features/user/types/user.types";

import { userEpisodeDelete } from "@/features/user/api/user.api";
import { userCachePolicy } from "@/features/user/cache/userCachePolicy";
import { queryKeys } from "@/lib/queryKeys";
import { useOptimisticMutation } from "@/lib/useOptimisticMutation";

export function useUserEpisodeDelete() {
  return useOptimisticMutation<
    UserEpisodeDeleteResponse,
    Error,
    UserEpisodeDeleteParams,
    void,
    SeriesGetResponse
  >({
    mutationFn: ({ seriesId, episodeId }) => userEpisodeDelete(seriesId, episodeId),

    getOptimisticQueryKey: ({ seriesId }) => queryKeys.series.detail(seriesId),

    getInvalidationFilters: ({ seriesId }) => userCachePolicy.episodeRemoved(seriesId),

    updateCache: (currentData, { episodeId }) => {
      const alreadyWatched = currentData.userEpisodes.some((item) => item.episodeId === episodeId);

      if (!alreadyWatched) {
        return currentData;
      }

      return {
        ...currentData,
        userEpisodes: currentData.userEpisodes.filter((item) => item.episodeId !== episodeId)
      };
    }
  });
}
