import { useQuery } from "@tanstack/react-query";

import { userSeriesGet } from "@/features/user/api/user.api";
import { queryKeys } from "@/lib/queryKeys";

export function useUserSeries(seriesId?: number) {
  return useQuery({
    queryKey: queryKeys.userSeries.list(seriesId),
    queryFn: () => userSeriesGet(seriesId),
    staleTime: 5 * 60 * 1000
  });
}
