import type { UserEpisodePostParams } from "../schemas/user.schemas";
import { userEpisodePost } from "../api/user.api";
import { queryKeys } from "@/lib/queryKeys";
import type { SeriesGetResponse } from "@/features/series/types/series.types";
import type { UserEpisodePostResponse } from "../types/user.types";
import { useOptimisticMutation } from "@/lib/useOptimisticMutation";
import { useQueryClient } from "@tanstack/react-query";
import type { UserEpisodesFeedGetResponse } from "../types/user.types";
import { updateUserEpisodesFeedItem } from "../utils/userEpisodesFeedCache";

export function useUserEpisodePost() {
  const queryClient = useQueryClient();

  return useOptimisticMutation<
    UserEpisodePostResponse,
    Error,
    UserEpisodePostParams,
    void,
    SeriesGetResponse
  >({
    mutationFn: ({ seriesId, episodeId }) => userEpisodePost(seriesId, episodeId),

    getQueryKey: ({ seriesId }) => queryKeys.series.detail(seriesId),

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
    },

    onSuccess: async (result) => {
      queryClient.setQueryData<UserEpisodesFeedGetResponse>(
        queryKeys.userEpisodes.feed(),
        (current) =>
          current
            ? updateUserEpisodesFeedItem(current, result.seriesId, result.nextEpisode)
            : current
      );

      await queryClient.invalidateQueries({
        queryKey: queryKeys.userEpisodes.feed(),
        refetchType: "none"
      });
    }
  });
}
