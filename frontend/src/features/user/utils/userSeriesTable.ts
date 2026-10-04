import {
  columnFacetingFeature,
  columnFilteringFeature,
  createColumnHelper,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  tableFeatures
} from "@tanstack/react-table";

import {
  filterSomeValuesInSelection,
  filterValueInSelection
} from "@/lib/facets/tanstackTableFacets";

import type { UserSeriesGetResponse } from "@/features/user/types/user.types";

type UserSeries = UserSeriesGetResponse["series"][number];

export const userSeriesTableFeatures = tableFeatures({
  columnFacetingFeature,
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues()
});

const columnHelper = createColumnHelper<typeof userSeriesTableFeatures, UserSeries>();

export const userSeriesColumns = columnHelper.columns([
  columnHelper.accessor("status", {
    id: "status",
    filterFn: filterValueInSelection
  }),

  columnHelper.accessor((serie) => serie.seriesGenres.map((genre) => genre.id), {
    id: "genre",
    filterFn: filterSomeValuesInSelection,
    getUniqueValues: (serie) => [...new Set(serie.seriesGenres.map((genre) => genre.id))]
  }),

  columnHelper.accessor((serie) => serie.seriesProviders.map((provider) => provider.id), {
    id: "provider",
    filterFn: filterSomeValuesInSelection,
    getUniqueValues: (serie) => [...new Set(serie.seriesProviders.map((provider) => provider.id))]
  })
]);
