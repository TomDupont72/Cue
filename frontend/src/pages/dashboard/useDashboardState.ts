import { useSearchParams } from "react-router-dom";

import type {
  UserSeriesFilters,
  UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";

import {
  updateUserSeriesFilters,
  updateUserSeriesGroupBy
} from "@/features/user/utils/userSeriesSearchParams";
import { dashboardStateSchema } from "@/pages/dashboard/dashboardState.schemas";

export function useDashboardState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const dashboardState = dashboardStateSchema.safeParse({
    groupBy: searchParams.get("group"),
    filters: {
      statuses: searchParams.getAll("statuses"),
      genres: searchParams.getAll("genres"),
      providers: searchParams.getAll("providers")
    }
  });

  const setGroupBy = (groupBy: UserSeriesGroupBy) => {
    setSearchParams((currentSearchParams) => updateUserSeriesGroupBy(currentSearchParams, groupBy));
  };

  const setFilters = (filters: UserSeriesFilters) => {
    setSearchParams((currentSearchParams) => updateUserSeriesFilters(currentSearchParams, filters));
  };

  return {
    ...dashboardState,
    setGroupBy,
    setFilters
  };
}
