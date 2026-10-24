import { useSearchParams } from "react-router-dom";

import type { UserSeriesGroupBy } from "@/features/user/types/userSeriesFacets.types";
import type { FacetMetrics } from "@/lib/facets/facet.types";

import { setUrlParams } from "@/lib/utils";
import { statsStateSchema } from "@/pages/stats/statsState.schemas";

export function useStatsState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const statsState = statsStateSchema.safeParse({
    groupBy: searchParams.get("group"),
    filters: {
      genres: searchParams.getAll("genres"),
      providers: searchParams.getAll("providers")
    },
    metric: searchParams.get("metric"),
    limit: searchParams.get("limit")
  });

  const setGroupBy = (groupBy: UserSeriesGroupBy) => {
    setSearchParams((currentSearchParams) =>
      setUrlParams(currentSearchParams, [{ name: "group", value: groupBy, defaultValue: "genre" }])
    );
  };

  const setMetric = (metric: keyof FacetMetrics) => {
    setSearchParams((currentSearchParams) =>
      setUrlParams(currentSearchParams, [{ name: "metric", value: metric, defaultValue: "count" }])
    );
  };

  const setLimit = (limit: number) => {
    setSearchParams((currentSearchParams) =>
      setUrlParams(currentSearchParams, [{ name: "limit", value: limit, defaultValue: 5 }])
    );
  };

  return {
    ...statsState,
    setGroupBy,
    setMetric,
    setLimit
  };
}
