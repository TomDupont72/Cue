import { useOptimisticMutation } from "@/lib/useOptimisticMutation";
import type { UserSeriesPostResponse } from "@/features/user/types/user.types";
import type { SeriesGetResponse } from "@/features/series/types/series.types";
import type {
  UserSeriesPostBody,
  UserSeriesPostParams
} from "@/features/user/schemas/user.schemas";
import { userSeriesPost } from "@/features/user/api/user.api";
import { queryKeys } from "@/lib/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import type { UserEpisodesFeedGetResponse } from "@/features/user/types/user.types";
import { updateUserEpisodesFeedItem } from "@/features/user/utils/userEpisodesFeedCache";

export function useUserSeriesPost() {
  const queryClient = useQueryClient();

  return useOptimisticMutation<
    UserSeriesPostResponse,
    Error,
    UserSeriesPostParams,
    UserSeriesPostBody,
    SeriesGetResponse
  >({
    mutationFn: ({ seriesId }, { status, isFavorite }) =>
      userSeriesPost(seriesId, status, isFavorite),

    getQueryKey: ({ seriesId }) => queryKeys.series.detail(seriesId),

    updateCache: (currentData, { seriesId }, body) => ({
      ...currentData,
      userSeries: currentData.userSeries
        ? {
            ...currentData.userSeries,
            ...body
          }
        : {
            userId: "optimistic",
            seriesId,
            status: body.status ?? "PLANNED",
            isFavorite: body.isFavorite ?? false,
            watchCount: 0,
            addedAt: new Date().toISOString(),
            lastWatchedAt: null
          }
    }),

    onSuccess: async (result) => {
      queryClient.setQueryData<UserEpisodesFeedGetResponse>(
        queryKeys.userEpisodes.feed(),
        (current) => {
          if (!current) return current;

          const currentItem = [...current.watching, ...current.paused, ...current.dropped].find(
            (item) => item.seriesId === result.seriesId
          );

          return updateUserEpisodesFeedItem(
            current,
            result.seriesId,
            currentItem ? { ...currentItem, status: result.status } : null
          );
        }
      );

      await queryClient.invalidateQueries({
        queryKey: queryKeys.userEpisodes.feed(),
        refetchType: "none"
      });
    }
  });
}
