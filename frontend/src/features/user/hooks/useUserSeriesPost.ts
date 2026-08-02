import { useOptimisticMutation } from "@/lib/useOptimisticMutation";
import type { UserSeriesPostResponse } from "@/features/user/types/user.types";
import type { SeriesGetResponse } from "@/features/series/types/series.types";
import type {
  UserSeriesPostBody,
  UserSeriesPostParams
} from "@/features/user/schemas/user.schemas";
import { userSeriesPost } from "@/features/user/api/user.api";
import { queryKeys } from "@/lib/queryKeys";

export function useUserSeriesPost() {
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
    })
  });
}
