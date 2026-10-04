import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  createColumnHelper,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  tableFeatures,
  type RowModel
} from "@tanstack/react-table";

import {
  createMultiValueGroupedRowModel,
  filterSomeValuesInSelection,
  filterValueInSelection
} from "@/lib/facets/tanstackTableFacets";

import type { FacetGroup } from "@/lib/facets/facet.types";
import type { UserSeriesGetResponse } from "@/features/user/types/user.types";

type UserSeries = UserSeriesGetResponse["series"][number];

export type UserSeriesGroup = FacetGroup & {
  series: UserSeries[];
};

export const userSeriesTableFeatures = tableFeatures({
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  filteredRowModel: createFilteredRowModel(),
  groupedRowModel: createMultiValueGroupedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues()
});

const columnHelper = createColumnHelper<typeof userSeriesTableFeatures, UserSeries>();

export const userSeriesColumns = columnHelper.columns([
  columnHelper.accessor("status", {
    id: "status",
    filterFn: filterValueInSelection,
    getGroupingValue: (serie) =>
      [{ value: serie.status, name: serie.status }] satisfies FacetGroup[]
  }),

  columnHelper.accessor((serie) => serie.seriesGenres.map((genre) => genre.id), {
    id: "genre",
    filterFn: filterSomeValuesInSelection,
    getUniqueValues: (serie) => [...new Set(serie.seriesGenres.map((genre) => genre.id))],
    getGroupingValue: (serie) =>
      serie.seriesGenres.map(({ id, name }) => ({ value: id, name })) satisfies FacetGroup[]
  }),

  columnHelper.accessor((serie) => serie.seriesProviders.map((provider) => provider.id), {
    id: "provider",
    filterFn: filterSomeValuesInSelection,
    getUniqueValues: (serie) => [...new Set(serie.seriesProviders.map((provider) => provider.id))],
    getGroupingValue: (serie) =>
      serie.seriesProviders.map(({ id, name }) => ({ value: id, name })) satisfies FacetGroup[]
  })
]);

export function userSeriesGroupsFromRowModel(
  rowModel: RowModel<typeof userSeriesTableFeatures, UserSeries>
): UserSeriesGroup[] {
  return rowModel.rows.map((row) => {
    const { value, name } = row.groupingValue as FacetGroup;

    return {
      value,
      name,
      series: row.subRows.map((subRow) => subRow.original)
    };
  });
}
