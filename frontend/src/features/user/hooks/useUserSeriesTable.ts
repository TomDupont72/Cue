import { useMemo } from "react";
import { useTable } from "@tanstack/react-table";

import { facetFiltersToColumnFilters } from "@/lib/facets/tanstackTableFacets";
import { userSeriesColumns, userSeriesTableFeatures } from "@/features/user/utils/userSeriesTable";

import type { UserSeriesGetResponse } from "@/features/user/types/user.types";
import type {
  UserSeriesFacetCounts,
  UserSeriesFilters
} from "@/features/user/types/userSeriesFacets.types";

type UseUserSeriesTableParams = {
  series: UserSeriesGetResponse["series"];
  filters: UserSeriesFilters;
};

export function useUserSeriesTable({ series, filters }: UseUserSeriesTableParams) {
  const columnFilters = useMemo(() => facetFiltersToColumnFilters(filters), [filters]);

  const table = useTable({
    features: userSeriesTableFeatures,
    columns: userSeriesColumns,
    data: series,
    state: { columnFilters }
  });

  const filteredSeries = table.getFilteredRowModel().rows.map((row) => row.original);

  const facetCounts: UserSeriesFacetCounts = {
    status: table.getColumn("status")!.getFacetedUniqueValues(),
    genre: table.getColumn("genre")!.getFacetedUniqueValues(),
    provider: table.getColumn("provider")!.getFacetedUniqueValues()
  };

  return {
    filteredSeries,
    facetCounts
  };
}
