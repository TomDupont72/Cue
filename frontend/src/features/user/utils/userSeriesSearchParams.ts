import type {
  UserSeriesFilters,
  UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";

import { setUrlSelectionParam } from "@/lib/utils";

export function updateUserSeriesGroupBy(
  currentSearchParams: URLSearchParams,
  groupBy: UserSeriesGroupBy
) {
  const nextSearchParams = new URLSearchParams(currentSearchParams);

  if (groupBy === "status") {
    nextSearchParams.delete("group");
  } else {
    nextSearchParams.set("group", groupBy);
  }

  return nextSearchParams;
}

export function updateUserSeriesFilters(
  currentSearchParams: URLSearchParams,
  filters: UserSeriesFilters
) {
  const nextSearchParams = new URLSearchParams(currentSearchParams);

  setUrlSelectionParam(nextSearchParams, "statuses", filters.status);
  setUrlSelectionParam(nextSearchParams, "genres", filters.genre);
  setUrlSelectionParam(nextSearchParams, "providers", filters.provider);

  return nextSearchParams;
}
