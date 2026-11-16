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

import type { UserSeriesGetResponse } from "@/features/user/types/user.types";
import type {
  UserRecentlyWatched,
  UserTimeRemaining
} from "@/features/user/types/userSeriesFacets.types";
import type { FacetGroup } from "@/lib/facets/facet.types";

import {
  RECENTLY_WATCHED_PERIODS,
  RECENTLY_WATCHED_VALUES,
  TIME_REMAINING_LIMITS,
  TIME_REMAINING_VALUES
} from "@/features/user/types/userSeriesFacets.types";
import {
  createMultiValueGroupedRowModel,
  filterSomeValuesInSelection,
  filterValueInSelection
} from "@/lib/facets/tanstackTableFacets";

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

export function getSeriesRecentlyWatched(serie: UserSeries): UserRecentlyWatched {
  const lastWatchedAtTimestamp = new Date(serie.lastWatchedAt ?? serie.addedAt).getTime();
  const elapsed = Date.now() - lastWatchedAtTimestamp;

  for (const value of RECENTLY_WATCHED_VALUES) {
    if (value !== "other" && elapsed <= RECENTLY_WATCHED_PERIODS[value]) {
      return value;
    }
  }

  return "other";
}

export function getSeriesTimeRemaining(serie: UserSeries): UserTimeRemaining | null {
  if (serie.remainingReleasedMinutes <= 0) {
    return null;
  }

  for (const value of TIME_REMAINING_VALUES) {
    if (value !== "overDay" && serie.remainingReleasedMinutes < TIME_REMAINING_LIMITS[value]) {
      return value;
    }
  }

  return "overDay";
}

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
  }),

  columnHelper.accessor(getSeriesRecentlyWatched, {
    id: "recentlyWatched",
    filterFn: filterValueInSelection,
    getGroupingValue: (serie) => {
      const value = getSeriesRecentlyWatched(serie);
      return [{ value, name: value }] satisfies FacetGroup[];
    }
  }),

  columnHelper.accessor(getSeriesTimeRemaining, {
    id: "timeRemaining",
    filterFn: filterValueInSelection,
    getUniqueValues: (serie) => {
      const value = getSeriesTimeRemaining(serie);
      return value ? [value] : [];
    },
    getGroupingValue: (serie) => {
      const value = getSeriesTimeRemaining(serie);
      return value ? ([{ value, name: value }] satisfies FacetGroup[]) : [];
    }
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
