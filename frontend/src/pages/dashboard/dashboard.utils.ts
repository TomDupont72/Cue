import type {
  UserSeriesFilters,
  UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";
import { setUrlSelectionParam } from "@/lib/utils";
import { type SetURLSearchParams } from "react-router-dom";

export const handleGroupByChange = (
  nextGroupBy: UserSeriesGroupBy,
  setSearchParams: SetURLSearchParams
) => {
  setSearchParams((currentSearchParams) => {
    const nextSearchParams = new URLSearchParams(currentSearchParams);

    if (nextGroupBy === "status") {
      nextSearchParams.delete("group");
    } else {
      nextSearchParams.set("group", nextGroupBy);
    }

    return nextSearchParams;
  });
};

export const handleFiltersApply = (
  nextFilters: UserSeriesFilters,
  setSearchParams: SetURLSearchParams
) => {
  setSearchParams((currentSearchParams) => {
    const nextSearchParams = new URLSearchParams(currentSearchParams);

    setUrlSelectionParam(nextSearchParams, "statuses", nextFilters.status);
    setUrlSelectionParam(nextSearchParams, "genres", nextFilters.genre);
    setUrlSelectionParam(nextSearchParams, "providers", nextFilters.provider);

    return nextSearchParams;
  });
};
