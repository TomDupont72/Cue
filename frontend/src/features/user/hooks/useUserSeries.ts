import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { userSeriesGet } from "../api/user.api";

export function useUserSeries(seriesId?: number) {
  return useQuery({
    queryKey: queryKeys.userSeries.list(seriesId),
    queryFn: () => userSeriesGet(seriesId),
    staleTime: 5 * 60 * 1000
  });
}
