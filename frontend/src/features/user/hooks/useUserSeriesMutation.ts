import { useOptimisticMutation } from "@/lib/useOptimisticMutation";
import type { UserSeriesPostResponse } from "@/features/user/types/user.types";
import type { SeriesGetResponse } from "@/features/series/types/series.types";
import type {
  UserSeriesPostBody,
  UserSeriesPostParams
} from "@/features/user/schemas/user.schemas";
import { userSeriesPost } from "@/features/user/api/user.api";
import { queryKeys } from "@/lib/queryKeys";
import { userCachePolicy } from "@/features/user/cache/userCachePolicy";

export function useUserSeriesMutation() {
  return useOptimisticMutation<
    UserSeriesPostResponse,
    Error,
    UserSeriesPostParams,
    UserSeriesPostBody,
    SeriesGetResponse
  >({
    mutationFn: ({ seriesId }, { status, isFavorite }) =>
      userSeriesPost(seriesId, status, isFavorite),

    getOptimisticQueryKey: ({ seriesId }) => queryKeys.series.detail(seriesId),

    getInvalidationFilters: ({ seriesId }) => userCachePolicy.seriesChanged(seriesId),

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
    })
  });
}
