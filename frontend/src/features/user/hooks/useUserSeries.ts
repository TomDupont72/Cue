import { queryKeys } from "@/lib/queryKeys";
import { useInfiniteQuery } from "@tanstack/react-query";
import { userSeriesGet } from "../api/user.api";
import type { UserSeriesStatus } from "../constants/userSeriesStatus";

const DASHBOARD_MAX_FETCH = 20;

export function useUserSeries(seriesId?: number, status?: UserSeriesStatus) {
  return useInfiniteQuery({
    queryKey: queryKeys.userSeries.list(seriesId, status),

    queryFn: ({ pageParam }) => userSeriesGet(DASHBOARD_MAX_FETCH, seriesId, status, pageParam),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,

    staleTime: 5 * 60 * 1000
  });
}
