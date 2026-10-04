import { useMemo } from "react";
import { useTable } from "@tanstack/react-table";

import { facetFiltersToColumnFilters } from "@/lib/facets/tanstackTableFacets";
import {
  userSeriesColumns,
  userSeriesGroupsFromRowModel,
  userSeriesTableFeatures
} from "@/features/user/utils/userSeriesTable";

import type { UserSeriesGetResponse } from "@/features/user/types/user.types";
import type {
  UserSeriesFacetCounts,
  UserSeriesFilters,
  UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";

type UseUserSeriesTableParams = {
  series: UserSeriesGetResponse["series"];
  filters: UserSeriesFilters;
  groupBy: UserSeriesGroupBy;
};

export function useUserSeriesTable({ series, filters, groupBy }: UseUserSeriesTableParams) {
  const columnFilters = useMemo(() => facetFiltersToColumnFilters(filters), [filters]);
  const grouping = useMemo(() => [groupBy], [groupBy]);

  const table = useTable({
    features: userSeriesTableFeatures,
    columns: userSeriesColumns,
    data: series,
    state: { columnFilters, grouping }
  });

  const groups = userSeriesGroupsFromRowModel(table.getRowModel());

  const facetCounts: UserSeriesFacetCounts = {
    status: table.getColumn("status")!.getFacetedUniqueValues(),
    genre: table.getColumn("genre")!.getFacetedUniqueValues(),
    provider: table.getColumn("provider")!.getFacetedUniqueValues()
  };

  return {
    groups,
    facetCounts
  };
}
