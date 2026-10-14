import { useSearchParams } from "react-router-dom";

import type {
  UserSeriesFilters,
  UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";
import {
  updateUserSeriesFilters,
  updateUserSeriesGroupBy
} from "@/features/user/utils/userSeriesSearchParams";
import { userDashboardSearchParamsSchema } from "../schemas/user.schemas";

export function useUserSeriesSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const dashboardParams = userDashboardSearchParamsSchema.safeParse({
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
    ...dashboardParams,
    setGroupBy,
    setFilters
  };
}
