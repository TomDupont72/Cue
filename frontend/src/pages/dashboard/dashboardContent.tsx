import FilterDrawer from "@/components/layout/filterDrawer";
import GroupDropdownMenu from "@/components/layout/groupDropdownMenu";
import { Heading } from "@/components/layout/heading";
import { PageContainer } from "@/components/layout/pageContainer";
import { PageSection } from "@/components/layout/pageSection";
import { GENRE_KEY_BY_NAME } from "@/features/genre/constants/genreName";
import UserDashboardSummaryWidget from "@/features/user/components/userDashboardSummaryWidget";
import { UserSeriesSection } from "@/features/user/components/userSeriesSection";
import {
  USER_SERIES_STATUS,
  type UserSeriesStatus
} from "@/features/user/constants/userSeriesStatus";
import { useUserSeriesTable } from "@/features/user/hooks/useUserSeriesTable";
import type {
  UserSeriesFilters,
  UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";
import type { UserDashboardSearchParams } from "@/features/user/schemas/user.schemas";
import type {
  UserDashboardSummaryGetResponse,
  UserSeriesGetResponse
} from "@/features/user/types/user.types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { handleFiltersApply, handleGroupByChange } from "@/pages/dashboard/dashboard.utils";
import { useSearchParams } from "react-router-dom";

type DashboardContentProps = {
  userSeries: UserSeriesGetResponse;
  dashboardSummary: UserDashboardSummaryGetResponse;
} & UserDashboardSearchParams;

const STATUS_ORDER: readonly UserSeriesStatus[] = [
  USER_SERIES_STATUS.WATCHING,
  USER_SERIES_STATUS.PAUSED,
  USER_SERIES_STATUS.PLANNED,
  USER_SERIES_STATUS.COMPLETED,
  USER_SERIES_STATUS.DROPPED
];

export default function DashboardContent({
  userSeries,
  dashboardSummary,
  groupBy,
  statuses,
  genres,
  providers
}: DashboardContentProps) {
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();

  const series = userSeries.series;

  const filters: UserSeriesFilters = {
    status: statuses
      ? statuses.length === 0
        ? { mode: "all" }
        : { mode: "include", values: statuses }
      : { mode: "include", values: [] },
    genre: genres
      ? genres.length === 0
        ? { mode: "all" }
        : { mode: "include", values: genres }
      : { mode: "include", values: [] },
    provider: providers
      ? providers.length === 0
        ? { mode: "all" }
        : { mode: "include", values: providers }
      : { mode: "include", values: [] }
  };

  const { groups, facetCounts } = useUserSeriesTable({
    series,
    filters,
    groupBy
  });

  const categoryNames = useMemo<Record<UserSeriesGroupBy, string>>(
    () => ({
      status: t("series:dashboard.categories.status"),
      genre: t("series:dashboard.categories.genre"),
      provider: t("series:dashboard.categories.provider")
    }),
    [t]
  );

  const filterOptions = useMemo(() => {
    const genresById = new Map<number, string>();
    const providersById = new Map<number, string>();

    for (const serie of series) {
      for (const genre of serie.seriesGenres) {
        genresById.set(genre.id, genre.name);
      }

      for (const provider of serie.seriesProviders) {
        providersById.set(provider.id, provider.name);
      }
    }

    const status = STATUS_ORDER.map((value) => ({
      value,
      label: t(`user:series.status.${value}.section`),
      count: facetCounts.status.get(value) ?? 0
    }));

    const genre = Array.from(genresById, ([value, name]) => ({
      value,
      label: t(`genre:${GENRE_KEY_BY_NAME[name] ?? "OTHER"}`),
      count: facetCounts.genre.get(value) ?? 0
    })).sort((first, second) => first.label.localeCompare(second.label));

    const provider = Array.from(providersById, ([value, name]) => ({
      value,
      label: name,
      count: facetCounts.provider.get(value) ?? 0
    })).sort((first, second) => first.label.localeCompare(second.label));

    return {
      status,
      genre,
      provider
    };
  }, [series, facetCounts, t]);

  const displayedGroups = useMemo(() => {
    const translatedGroups = groups.map((group) => {
      let label: string;

      switch (groupBy) {
        case "status":
          label = t(`user:series.status.${String(group.value)}.section`);
          break;

        case "genre":
          label = t(`genre:${GENRE_KEY_BY_NAME[group.name] ?? "OTHER"}`);
          break;

        case "provider":
          label = group.name;
          break;
      }

      return { ...group, label };
    });

    if (groupBy === "status") {
      return translatedGroups.sort(
        (first, second) =>
          STATUS_ORDER.indexOf(first.value as UserSeriesStatus) -
          STATUS_ORDER.indexOf(second.value as UserSeriesStatus)
      );
    }

    return translatedGroups.sort((first, second) => first.label.localeCompare(second.label));
  }, [groups, groupBy, t]);

  return (
    <PageContainer className="gap-18">
      <PageSection>
        <Heading level={1} className="uppercase">
          {t("user:stats.title")}
        </Heading>

        <UserDashboardSummaryWidget
          totalWatchedMinutes={dashboardSummary.totalWatchedMinutes}
          totalWatchedEpisodes={dashboardSummary.totalWatchedEpisodes}
          totalWatchedSeries={dashboardSummary.totalWatchedSeries}
        />
      </PageSection>

      <PageSection>
        <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Heading level={1} full={false} className="uppercase">
            {t("user:series.mySeries")}
          </Heading>

          <div className="flex flex-row gap-4">
            <GroupDropdownMenu
              categories={categoryNames}
              category={categoryNames[groupBy]}
              onCategoryChange={(value) =>
                handleGroupByChange(value as UserSeriesGroupBy, setSearchParams)
              }
            />
            <FilterDrawer
              labels={categoryNames}
              options={filterOptions}
              value={filters}
              onApply={(nextFilters) => handleFiltersApply(nextFilters, setSearchParams)}
              title={t("common:actions.filterMySeries")}
            />
          </div>
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
    </PageContainer>
  );
}
