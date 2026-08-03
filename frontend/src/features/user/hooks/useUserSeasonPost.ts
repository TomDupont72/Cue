import type { SeriesGetResponse } from "@/features/series/types/series.types";
import { useOptimisticMutation } from "@/lib/useOptimisticMutation";
import type { UserSeasonPostResponse } from "@/features/user/types/user.types";
import { userSeasonPost } from "@/features/user/api/user.api";
import { queryKeys } from "@/lib/queryKeys";
import type { UserSeasonPostParams } from "@/features/user/schemas/user.schemas";

export function useUserSeasonPost() {
  return useOptimisticMutation<
    UserSeasonPostResponse,
    Error,
    UserSeasonPostParams,
    void,
    SeriesGetResponse
  >({
    mutationFn: ({ seriesId, seasonId }) => userSeasonPost(seriesId, seasonId),

    getQueryKey: ({ seriesId }) => queryKeys.series.detail(seriesId),

    updateCache: (currentData, { seasonId }) => {
      const watchedEpisodeIds = new Set(
        currentData.userEpisodes.map((userEpisode) => userEpisode.episodeId)
      );
      const watchedAt = new Date().toISOString();
      const newUserEpisodes = currentData.episodes
        .filter((episode) => episode.seasonId === seasonId && !watchedEpisodeIds.has(episode.id))
        .map((episode) => ({
          userId: "optimistic",
          episodeId: episode.id,
          watchedAt
        }));

      if (newUserEpisodes.length === 0) {
        return currentData;
      }

      return {
        ...currentData,
        userEpisodes: [...currentData.userEpisodes, ...newUserEpisodes]
      };
    }
  });
}
