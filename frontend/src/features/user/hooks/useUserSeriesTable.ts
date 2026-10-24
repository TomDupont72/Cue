import { useTable } from "@tanstack/react-table";
import { useMemo } from "react";

import type { UserSeriesGetResponse } from "@/features/user/types/user.types";
import type {
  UserSeriesFacetMetrics,
  UserSeriesFacetMetricsFor,
  UserSeriesFacetSchema,
  UserSeriesFiltersFor,
  UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";
import type { FacetOptionValues } from "@/lib/facets/facet.types";

import {
  userSeriesColumns,
  userSeriesGroupsFromRowModel,
  userSeriesTableFeatures
} from "@/features/user/utils/userSeriesTable";
import {
  createColumnFacetMetrics,
  facetFiltersToColumnFilters
} from "@/lib/facets/tanstackTableFacets";

type UseUserSeriesTableParams<TKey extends UserSeriesGroupBy> = {
  series: UserSeriesGetResponse["series"];
  filters: UserSeriesFiltersFor<TKey>;
  optionValues: Pick<FacetOptionValues<UserSeriesFacetSchema>, TKey>;
  groupBy?: UserSeriesGroupBy;
};

export function useUserSeriesTable<TKey extends UserSeriesGroupBy>({
  series,
  filters,
  optionValues,
  groupBy
}: UseUserSeriesTableParams<TKey>) {
  const facetKeys = Object.keys(filters) as TKey[];
  const columnFilters = useMemo(
    () => facetFiltersToColumnFilters<UserSeriesFacetSchema>(filters, optionValues),
    [filters, optionValues]
  );
  const grouping = useMemo(() => (groupBy ? [groupBy] : []), [groupBy]);

  const table = useTable({
    features: userSeriesTableFeatures,
    columns: userSeriesColumns,
    data: series,
    state: { columnFilters, grouping }
  });

  const groups = groupBy ? userSeriesGroupsFromRowModel(table.getRowModel()) : [];
  const facetMetrics: Partial<UserSeriesFacetMetrics> = {};
  const getWatchedMinutes = (item: UserSeriesGetResponse["series"][number]) => item.watchedMinutes;

  for (const facetKey of facetKeys) {
    switch (facetKey) {
      case "status":
        facetMetrics.status = createColumnFacetMetrics(
          table.getColumn("status")!,
          getWatchedMinutes
        );
        break;

      case "genre":
        facetMetrics.genre = createColumnFacetMetrics(table.getColumn("genre")!, getWatchedMinutes);
        break;

      case "provider":
        facetMetrics.provider = createColumnFacetMetrics(
          table.getColumn("provider")!,
          getWatchedMinutes
        );
        break;
    }
  }

  return {
    groups,
    facetMetrics: facetMetrics as UserSeriesFacetMetricsFor<TKey>
  };
}
