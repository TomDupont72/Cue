import { Heading } from "@/components/layout/heading";
import { PageSection } from "@/components/layout/pageSection";
import { UserSeriesSection } from "@/features/user/components/userSeriesSection";
import { UserSeriesToolbar } from "@/features/user/components/userSeriesToolbar";
import { useUserSeriesView } from "@/features/user/hooks/useUserSeriesView";
import type {
  UserSeriesFilters,
  UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";
import type { UserSeriesGetResponse } from "@/features/user/types/user.types";
import { useTranslation } from "react-i18next";

type UserSeries = UserSeriesGetResponse["series"][number];

type UserSeriesLibraryProps = {
  series: UserSeries[];
  groupBy: UserSeriesGroupBy;
  filters: UserSeriesFilters;
  onGroupByChange: (groupBy: UserSeriesGroupBy) => void;
  onFiltersChange: (filters: UserSeriesFilters) => void;
};

export function UserSeriesLibrary({
  series,
  groupBy,
  filters,
  onGroupByChange,
  onFiltersChange
}: UserSeriesLibraryProps) {
  const { t } = useTranslation();

  const { categoryNames, filterOptions, displayedGroups } = useUserSeriesView({
    series,
    filters,
    groupBy
  });

  return (
    <PageSection>
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Heading level={1} full={false} className="uppercase">
          {t("user:series.mySeries")}
        </Heading>

        <UserSeriesToolbar
          groupBy={groupBy}
          filters={filters}
          categoryNames={categoryNames}
          filterOptions={filterOptions}
          onGroupByChange={onGroupByChange}
          onFiltersChange={onFiltersChange}
        />
      </div>

      <div className="flex w-full flex-col gap-4">
        {displayedGroups.map((group) => (
          <div
            key={`${groupBy}-${group.value}`}
            style={{
              contentVisibility: "auto",
              containIntrinsicSize: "500px"
            }}
          >
            <UserSeriesSection series={group.series} category={group.label} />
          </div>
        ))}
      </div>
    </PageSection>
  );
}
