import { skipToken, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { seriesSearchGet } from "../api/series.api";
import { seriesSearchGetParamsSchema } from "../schemas/series.schemas";

export function useSeriesSearch(query: string, page: number) {
  const normalizedQuery = query.trim();
  const parsedParams = seriesSearchGetParamsSchema.safeParse({
    query: normalizedQuery,
    page
  });

  return useQuery({
    queryKey: queryKeys.series.search(normalizedQuery, page),
    queryFn: parsedParams.success
      ? () => seriesSearchGet(parsedParams.data.query, parsedParams.data.page)
      : skipToken,
    staleTime: 5 * 60 * 1000
  });
}
