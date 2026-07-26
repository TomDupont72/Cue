import { queryKeys } from "@/lib/queryKeys";
import { useInfiniteQuery } from "@tanstack/react-query";
import { userSeriesGet } from "../api/user.api";
import type { UserSeriesStatus } from "../constants/userSeriesStatus";

const DASHBOARD_MAX_FETCH = 20;

export function useUserSeries(status: UserSeriesStatus) {
  return useInfiniteQuery({
    queryKey: queryKeys.userSeries.list(status),

    queryFn: ({ pageParam }) =>
      userSeriesGet({
        status,
        limit: DASHBOARD_MAX_FETCH,
        cursor: pageParam
      }),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,

    staleTime: 5 * 60 * 1000
  });
}
