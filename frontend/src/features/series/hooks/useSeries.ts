import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { seriesGet } from "../api/series.api";

export function useSeries(id: number) {
  return useQuery({
    queryKey: queryKeys.series.detail(id),
    queryFn: () => seriesGet(id),
    staleTime: 5 * 60 * 1000
  });
}
