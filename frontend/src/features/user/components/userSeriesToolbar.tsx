import FilterDrawer from "@/components/layout/filterDrawer";
import GroupDropdownMenu from "@/components/layout/groupDropdownMenu";
import type { FacetOptions } from "@/lib/facets/facet.types";
import type {
  UserSeriesFacetSchema,
  UserSeriesFilters,
  UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";
import { useTranslation } from "react-i18next";

type UserSeriesToolbarProps = {
  groupBy: UserSeriesGroupBy;
  filters: UserSeriesFilters;
  categoryNames: Record<UserSeriesGroupBy, string>;
  filterOptions: FacetOptions<UserSeriesFacetSchema>;
  onGroupByChange: (groupBy: UserSeriesGroupBy) => void;
  onFiltersChange: (filters: UserSeriesFilters) => void;
};

export function UserSeriesToolbar({
  groupBy,
  filters,
  categoryNames,
  filterOptions,
  onGroupByChange,
  onFiltersChange
}: UserSeriesToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row gap-4">
      <GroupDropdownMenu
        categories={categoryNames}
        category={categoryNames[groupBy]}
        onCategoryChange={(value) => onGroupByChange(value as UserSeriesGroupBy)}
      />

      <FilterDrawer
        labels={categoryNames}
        options={filterOptions}
        value={filters}
        onApply={onFiltersChange}
        title={t("common:actions.filterMySeries")}
      />
    </div>
  );
}
