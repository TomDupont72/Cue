import { useSearchParams } from "react-router-dom";

import type { UserEpisodesActivityPeriod } from "@/features/user/constants/userEpisodesActivity";
import type { UserSeriesGroupBy } from "@/features/user/types/userSeriesFacets.types";
import type { FacetMetrics } from "@/lib/facets/facet.types";

import { setUrlListParam, setUrlParams } from "@/lib/utils";
import { statsStateSchema } from "@/pages/stats/statsState.schemas";

type AreaMetric = "watchedEpisodes" | "watchedMinutes";

export function useStatsState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const statsState = statsStateSchema.safeParse({
    groupBy: searchParams.get("group"),
    filters: {
      genres: searchParams.getAll("genres"),
      providers: searchParams.getAll("providers")
    },
    pieMetric: searchParams.get("pieMetric"),
    areaMetric: searchParams.get("areaMetric"),
    areaPeriod: searchParams.get("areaPeriod"),
    limit: searchParams.get("limit"),
    seriesIds: searchParams.getAll("seriesId")
  });

  const setGroupBy = (groupBy: UserSeriesGroupBy) => {
    setSearchParams((currentSearchParams) =>
      setUrlParams(currentSearchParams, [{ name: "group", value: groupBy, defaultValue: "genre" }])
    );
  };

  const setPieMetric = (metric: keyof FacetMetrics) => {
    setSearchParams((currentSearchParams) =>
      setUrlParams(currentSearchParams, [
        { name: "pieMetric", value: metric, defaultValue: "count" }
      ])
    );
  };

  const setAreaMetric = (metric: AreaMetric) => {
    setSearchParams((currentSearchParams) =>
      setUrlParams(currentSearchParams, [
        { name: "areaMetric", value: metric, defaultValue: "watchedEpisodes" }
      ])
    );
  };

  const setAreaPeriod = (period: UserEpisodesActivityPeriod) => {
    setSearchParams((currentSearchParams) =>
      setUrlParams(currentSearchParams, [
        { name: "areaPeriod", value: period, defaultValue: "months3" }
      ])
    );
  };

  const setLimit = (limit: number) => {
    setSearchParams((currentSearchParams) =>
      setUrlParams(currentSearchParams, [{ name: "limit", value: limit, defaultValue: 5 }])
    );
  };

  const setSeriesIds = (seriesIds: readonly number[]) => {
    setSearchParams((currentSearchParams) => {
      const nextSearchParams = new URLSearchParams(currentSearchParams);

      setUrlListParam(nextSearchParams, "seriesId", seriesIds);

      return nextSearchParams;
    });
  };

  return {
    ...statsState,
    setGroupBy,
    setPieMetric,
    setAreaMetric,
    setAreaPeriod,
    setLimit,
    setSeriesIds
  };
}
