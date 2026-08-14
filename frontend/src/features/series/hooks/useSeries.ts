import { queryKeys } from "@/lib/queryKeys";
import { skipToken, useQuery } from "@tanstack/react-query";
import { seriesGet } from "@/features/series/api/series.api";
import { seriesGetParamsSchema } from "@/features/series/schemas/series.schemas";

export function useSeries(id: number) {
  const parsedParams = seriesGetParamsSchema.safeParse({ id });

  return useQuery({
    queryKey: queryKeys.series.detail(id),
    queryFn: parsedParams.success ? () => seriesGet(parsedParams.data.id) : skipToken,
    staleTime: 5 * 60 * 1000
  });
}
