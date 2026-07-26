import { queryKeys } from "@/lib/queryKeys";
import { useInfiniteQuery } from "@tanstack/react-query";
import { userSeriesGet } from "../api/user.api";

const DASHBOARD_MAX_FETCH = 20;

export function useUserSeries() {
  return useInfiniteQuery({
    queryKey: queryKeys.userSeries.list(),

    queryFn: ({ pageParam }) => userSeriesGet(DASHBOARD_MAX_FETCH, pageParam),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,

    staleTime: 5 * 60 * 1000
  });
}
