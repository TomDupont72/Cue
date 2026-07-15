import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { seriesImportPost } from "../api/series.api";

export function useSeriesImport(tmdbId: number) {
  return useQuery({
    queryKey: queryKeys.series.overview(tmdbId),
    queryFn: () => seriesImportPost(tmdbId),
    staleTime: 5 * 60 * 1000
  });
}
