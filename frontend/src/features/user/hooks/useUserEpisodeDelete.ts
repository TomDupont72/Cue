import { useOptimisticMutation } from "@/lib/useOptimisticMutation";
import { queryKeys } from "@/lib/queryKeys";

import type { SeriesGetResponse } from "@/features/series/types/series.types";
import type { UserEpisodeDeleteParams } from "../schemas/user.schemas";
import type { UserEpisodeDeleteResponse } from "../types/user.types";

import { userEpisodeDelete } from "../api/user.api";

export function useUserEpisodeDelete() {
  return useOptimisticMutation<
    UserEpisodeDeleteResponse,
    Error,
    UserEpisodeDeleteParams,
    SeriesGetResponse
  >({
    mutationFn: ({ seriesId, episodeId }) => userEpisodeDelete(seriesId, episodeId),

    getQueryKey: ({ seriesId }) => queryKeys.series.detail(seriesId),

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
