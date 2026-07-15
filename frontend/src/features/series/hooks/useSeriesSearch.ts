import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { seriesSearchGet } from "../api/series.api";

export function useSeriesSearch(query: string, page: number) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: queryKeys.series.search(normalizedQuery, page),
    queryFn: () => seriesSearchGet(normalizedQuery, page),
    staleTime: 5 * 60 * 1000
  });
}
