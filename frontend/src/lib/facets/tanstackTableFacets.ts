import {
  copyInstancePropertiesWithoutMemos,
  constructFilterFn,
  constructRow,
  makeObjectMap,
  tableMemo,
  type Atoms_All,
  type columnGroupingFeature,
  type ColumnFiltersState,
  type GroupingState,
  type Row,
  type RowData,
  type RowModel,
  type Row_ColumnGrouping,
  type Table,
  type TableFeatures
} from "@tanstack/react-table";

import type { FacetFilters, FacetGroup, FacetSelection } from "@/lib/facets/facet.types";

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

type GroupingFeatures = TableFeatures & {
  columnGroupingFeature: typeof columnGroupingFeature;
};

const EMPTY_GROUPING: GroupingState = [];

export type FacetGroupRow<TFeatures extends GroupingFeatures, TData extends RowData> = Row<
  TFeatures,
  TData
> & {
  groupingColumnId: string;
  groupingValue: FacetGroup;
};

type GroupableRow<TFeatures extends TableFeatures, TData extends RowData> = Row<TFeatures, TData> &
  Row_ColumnGrouping;

function isFacetValue(value: unknown): value is FacetGroup["value"] {
  return typeof value === "string" || typeof value === "number";
}

function toFacetGroups(value: unknown): FacetGroup[] {
  const values = Array.isArray(value) ? value : [value];
  const groups = new Map<string, FacetGroup>();

  for (const item of values) {
    const group =
      typeof item === "object" && item !== null && "value" in item && isFacetValue(item.value)
        ? {
            value: item.value,
            name: "name" in item && typeof item.name === "string" ? item.name : String(item.value)
          }
        : isFacetValue(item)
          ? { value: item, name: String(item) }
          : null;

    if (group) {
      groups.set(`${typeof group.value}:${String(group.value)}`, group);
    }
  }

  return Array.from(groups.values());
}

function groupIdSegment(columnId: string, value: FacetGroup["value"]): string {
  return `${columnId}:${typeof value}:${encodeURIComponent(String(value))}`;
}

/**
 * TanStack grouped row model where one source row can belong to several values
 * of the same grouping column.
 */
export function createMultiValueGroupedRowModel() {
  return <TFeatures extends GroupingFeatures, TData extends RowData>(
    table: Table<TFeatures, TData>
  ) => {
    const groupingAtom = (table.atoms as Atoms_All).grouping;

    return tableMemo({
      feature: "columnGroupingFeature",
      table,
      fnName: "table.getGroupedRowModel",
      memoDeps: () => [
        groupingAtom?.get() ?? EMPTY_GROUPING,
        table.getPreGroupedRowModel(),
        table.options.columns
      ],
      fn: (grouping, preGroupedRowModel): RowModel<TFeatures, TData> => {
        if (!grouping.length || !preGroupedRowModel.rows.length) {
          return preGroupedRowModel;
        }

        const groupingColumns = grouping.filter((columnId) => table.getColumn(columnId));

        if (!groupingColumns.length) {
          return preGroupedRowModel;
        }

        const flatRows: Row<TFeatures, TData>[] = [];
        const rowsById = makeObjectMap<Row<TFeatures, TData>>();

        const cloneRow = (
          sourceRow: Row<TFeatures, TData>,
          depth: number,
          parentId: string
        ): Row<TFeatures, TData> => {
          const id = `${parentId}>${sourceRow.id}`;
          const row = constructRow(
            table,
            id,
            sourceRow.original,
            sourceRow.index,
            depth,
            [],
            parentId
          );

          copyInstancePropertiesWithoutMemos(row, sourceRow);
          Object.assign(row, {
            _displayIndexCache: -1,
            id,
            depth,
            parentId,
            subRows: []
          });

          flatRows.push(row);
          rowsById[id] = row;

          row.subRows = sourceRow.subRows.map((subRow) => cloneRow(subRow, depth + 1, id));

          return row;
        };

        const groupRows = (
          rows: Row<TFeatures, TData>[],
          depth = 0,
          parentId?: string,
          groupingPath: ReadonlyMap<string, FacetGroup> = new Map()
        ): Row<TFeatures, TData>[] => {
          if (depth >= groupingColumns.length) {
            if (!parentId) {
              return rows;
            }

            return rows.map((row) => cloneRow(row, depth, parentId));
          }

          const columnId = groupingColumns[depth];
          const buckets = new Map<string, { group: FacetGroup; rows: Row<TFeatures, TData>[] }>();

          for (const row of rows) {
            const groups = toFacetGroups(
              (row as GroupableRow<TFeatures, TData>).getGroupingValue(columnId)
            );

            for (const group of groups) {
              const key = `${typeof group.value}:${String(group.value)}`;
              const bucket = buckets.get(key);

              if (bucket) {
                bucket.rows.push(row);
              } else {
                buckets.set(key, { group, rows: [row] });
              }
            }
          }

          return Array.from(buckets.values(), (bucket, index) => {
            const idSegment = groupIdSegment(columnId, bucket.group.value);
            const id = parentId ? `${parentId}>${idSegment}` : idSegment;
            const flatRowIndex = flatRows.length;
            const nextGroupingPath = new Map(groupingPath).set(columnId, bucket.group);

            flatRows.push(undefined as unknown as Row<TFeatures, TData>);

            const subRows = groupRows(bucket.rows, depth + 1, id, nextGroupingPath);
            const row = constructRow(
              table,
              id,
              bucket.rows[0].original,
              index,
              depth,
              subRows,
              parentId
            ) as FacetGroupRow<TFeatures, TData>;

            row.groupingColumnId = columnId;
            row.groupingValue = bucket.group;

            for (const [groupingColumnId, group] of nextGroupingPath) {
              row._valuesCache[groupingColumnId] = group.value;
            }

            flatRows[flatRowIndex] = row;
            rowsById[id] = row;
            return row;
          });
        };

        const rows = groupRows(preGroupedRowModel.rows);

        return { rows, flatRows, rowsById };
      }
    });
  };
}
