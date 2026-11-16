import { useTranslation } from "react-i18next";

import type {
  UserSeriesFacetLabels,
  UserSeriesFilterKey,
  UserSeriesFilterSchema,
  UserSeriesFilters,
  UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";
import type { FacetOptions } from "@/lib/facets/facet.types";

import FilterDrawer from "@/components/layout/filterDrawer";
import GroupDropdownMenu from "@/components/layout/groupDropdownMenu";

type UserSeriesToolbarProps = {
  groupBy: UserSeriesGroupBy;
  filters: UserSeriesFilters;
  groupCategoryNames: Record<UserSeriesGroupBy, string>;
  filterCategoryNames: Pick<UserSeriesFacetLabels, UserSeriesFilterKey>;
  filterOptions: FacetOptions<UserSeriesFilterSchema>;
  onGroupByChange: (groupBy: UserSeriesGroupBy) => void;
  onFiltersChange: (filters: UserSeriesFilters) => void;
};

export function UserSeriesToolbar({
  groupBy,
  filters,
  groupCategoryNames,
  filterCategoryNames,
  filterOptions,
  onGroupByChange,
  onFiltersChange
}: UserSeriesToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row gap-4">
      <GroupDropdownMenu
        categories={groupCategoryNames}
        category={groupCategoryNames[groupBy]}
        onCategoryChange={(value) => onGroupByChange(value as UserSeriesGroupBy)}
      />

      <FilterDrawer<UserSeriesFilterSchema>
        labels={filterCategoryNames}
        options={filterOptions}
        value={filters}
        onApply={onFiltersChange}
        title={t("common:actions.filterMySeries")}
      />
    </div>
  );
}
