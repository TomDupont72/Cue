import type { SeriesGetResponse } from "@/features/series/types/series.types";
import { useOptimisticMutation } from "@/lib/useOptimisticMutation";
import type { UserSeasonDeleteResponse } from "@/features/user/types/user.types";
import type { UserSeasonDeleteParams } from "@/features/user/schemas/user.schemas";
import { userSeasonDelete } from "@/features/user/api/user.api";
import { queryKeys } from "@/lib/queryKeys";
import { userCachePolicy } from "@/features/user/cache/userCachePolicy";

export function useUserSeasonDelete() {
  return useOptimisticMutation<
    UserSeasonDeleteResponse,
    Error,
    UserSeasonDeleteParams,
    void,
    SeriesGetResponse
  >({
    mutationFn: ({ seriesId, seasonId }) => userSeasonDelete(seriesId, seasonId),

    getOptimisticQueryKey: ({ seriesId }) => queryKeys.series.detail(seriesId),

    getInvalidationFilters: ({ seriesId }) => userCachePolicy.seasonRemoved(seriesId),

    updateCache: (currentData, { seasonId }) => {
      const seasonEpisodeIds = new Set(
        currentData.episodes
          .filter((episode) => episode.seasonId === seasonId)
          .map((episode) => episode.id)
      );

      return {
        ...currentData,
        userEpisodes: currentData.userEpisodes.filter(
          (userEpisode) => !seasonEpisodeIds.has(userEpisode.episodeId)
        )
      };
    }
  });
}
