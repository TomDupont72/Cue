import { constructFilterFn, type ColumnFiltersState } from "@tanstack/react-table";

import type { FacetFilters, FacetSelection } from "@/lib/facets/facet.types";

function toSelectionSet(value: unknown): ReadonlySet<unknown> {
  return new Set(Array.isArray(value) ? value : []);
}

export const filterValueInSelection = constructFilterFn({
  filter: (dataValue, selectedValues: ReadonlySet<unknown>) => selectedValues.has(dataValue),

  resolveFilterValue: toSelectionSet,
  autoRemove: (value) => value === null || value === undefined
});

export const filterSomeValuesInSelection = constructFilterFn({
  filter: (dataValues: unknown, selectedValues: ReadonlySet<unknown>) =>
    Array.isArray(dataValues) && dataValues.some((value) => selectedValues.has(value)),

  resolveFilterValue: toSelectionSet,

  autoRemove: (value) => value === null || value === undefined
});

export function facetFiltersToColumnFilters<TSchema>(
  filters: FacetFilters<TSchema>
): ColumnFiltersState {
  return Object.entries(filters as Record<string, FacetSelection<string | number>>).flatMap(
    ([id, selection]) => (selection.mode === "all" ? [] : [{ id, value: selection.values }])
  );
}
