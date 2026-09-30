import { EmptyState } from "@/components/feedback/emptyState";
import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import FilterDrawer from "@/components/layout/filterDrawer";
import GroupDropdownMenu from "@/components/layout/groupDropdownMenu";
import { Heading } from "@/components/layout/heading";
import { PageContainer } from "@/components/layout/pageContainer";
import { PageSection } from "@/components/layout/pageSection";
import { GENRE_KEY_BY_NAME } from "@/features/genre/constants/genreName";
import UserDashboardSummaryWidget from "@/features/user/components/userDashboardSummaryWidget";
import { UserSeriesSection } from "@/features/user/components/userSeriesSection";
import { USER_SERIES_STATUS } from "@/features/user/constants/userSeriesStatus";
import { useUserDashboardSummary } from "@/features/user/hooks/useUserDashboardSummary";
import { useUserSeries } from "@/features/user/hooks/useUserSeries";
import type { UserSeriesGetResponse } from "@/features/user/types/user.types";
import type { TFunction } from "i18next";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";

const EMPTY_SERIES: UserSeriesGetResponse["series"] = [];

const getSeriesIdsByCategory = (series: UserSeriesGetResponse["series"], t: TFunction) => {
  const seriesByStatus = new Map();
  for (const serie of series) {
    const statusName = t(`user:series.status.${USER_SERIES_STATUS[serie.status]}.section`);
    const currentValue = seriesByStatus.get(statusName) ?? [];
    seriesByStatus.set(statusName, [...currentValue, serie]);
  }

  const seriesIdsByStatusOrder = [
    t(`user:series.status.${USER_SERIES_STATUS.WATCHING}.section`),
    t(`user:series.status.${USER_SERIES_STATUS.PAUSED}.section`),
    t(`user:series.status.${USER_SERIES_STATUS.PLANNED}.section`),
    t(`user:series.status.${USER_SERIES_STATUS.COMPLETED}.section`),
    t(`user:series.status.${USER_SERIES_STATUS.DROPPED}.section`)
  ];

  const seriesByStatusSorted = new Map(
    Array.from(seriesByStatus.entries()).sort(
      ([keyA], [keyB]) =>
        seriesIdsByStatusOrder.indexOf(keyA) - seriesIdsByStatusOrder.indexOf(keyB)
    )
  );

  const seriesByGenre = new Map();
  for (const serie of series) {
    for (const genre of serie.seriesGenres) {
      const genreName = t(`genre:${GENRE_KEY_BY_NAME[genre.name] ?? "OTHER"}`);
      const currentValue = seriesByGenre.get(genreName) ?? [];
      seriesByGenre.set(genreName, [...currentValue, serie]);
    }
  }

  const seriesByGenreSorted = new Map(
    Array.from(seriesByGenre.entries()).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
  );

  const seriesByProvider = new Map();
  for (const serie of series) {
    for (const provider of serie.seriesProviders) {
      const currentValue = seriesByProvider.get(provider.name) ?? [];
      seriesByProvider.set(provider.name, [...currentValue, serie]);
    }
  }

  const seriesByProviderSorted = new Map(
    Array.from(seriesByProvider.entries()).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
  );

  return [seriesByStatusSorted, seriesByGenreSorted, seriesByProviderSorted];
};

const getCategoryFilters = (
  seriesMapByCategory: Record<string, Map<string, UserSeriesGetResponse["series"]>>,
  categoryNames: Record<string, string>
) => {
  const categoryFilters = Object.fromEntries(
    Object.entries(seriesMapByCategory).map(([key, seriesByCategory]) => [
      categoryNames[key],
      Object.fromEntries(
        Array.from(seriesByCategory.entries(), ([category, series]) => [
          category,
          { checked: true, length: series.length }
        ])
      )
    ])
  );

  const categoryFiltersOrder = [
    categoryNames["status"],
    categoryNames["genre"],
    categoryNames["provider"]
  ];

  const categoryFiltersSorted = new Map(
    Object.entries(categoryFilters).sort(
      ([keyA], [keyB]) => categoryFiltersOrder.indexOf(keyA) - categoryFiltersOrder.indexOf(keyB)
    )
  );

  return categoryFiltersSorted;
};

const filterSeries = (
  filters: Map<string, Record<string, { checked: boolean; length: number }>>,
  categoryNames: Record<string, string>,
  series: UserSeriesGetResponse["series"],
  t: TFunction
) => {
  const statusToKeep = new Set(
    Object.entries(filters.get(categoryNames["status"]) ?? []).map(([status, metadata]) => {
      if (metadata.checked) {
        return status;
      }
    })
  );
  const genreToKeep = new Set(
    Object.entries(filters.get(categoryNames["genre"]) ?? []).map(([genre, metadata]) => {
      if (metadata.checked) {
        return genre;
      }
    })
  );
  const providerToKeep = new Set(
    Object.entries(filters.get(categoryNames["provider"]) ?? []).map(([provider, metadata]) => {
      if (metadata.checked) {
        return provider;
      }
    })
  );

  const seriesFiltered = series.filter((serie) => {
    let genreKeep = false;
    let providerKeep = false;

    if (!statusToKeep.has(t(`user:series.status.${USER_SERIES_STATUS[serie.status]}.section`))) {
      return false;
    }

    for (const genre of serie.seriesGenres) {
      if (genreToKeep.has(t(`genre:${GENRE_KEY_BY_NAME[genre.name] ?? "OTHER"}`))) {
        genreKeep = true;
      }
    }
    if (!genreKeep) {
      return false;
    }

    for (const provider of serie.seriesProviders) {
      if (providerToKeep.has(provider.name)) {
        providerKeep = true;
      }
    }
    if (!providerKeep) {
      return false;
    }

    return true;
  });

  return seriesFiltered;
};

export default function Dashboard() {
  const { t } = useTranslation();
  const [, startTransition] = useTransition();

  const dashboardSummaryQuery = useUserDashboardSummary();
  const userSeriesQuery = useUserSeries();

  const series = userSeriesQuery.data?.series ?? EMPTY_SERIES;

  const isPending = userSeriesQuery.isPending || dashboardSummaryQuery.isPending;
  const [category, setCategory] = useState<string>("status");

  const handleCategoryChange = (value: string) => {
    startTransition(() => setCategory(value));
  };

  const [seriesByStatus, seriesByGenre, seriesByProvider] = useMemo(
    () => getSeriesIdsByCategory(series, t),
    [series, t]
  );

  const seriesMapByCategory = useMemo(
    () => ({
      status: seriesByStatus,
      genre: seriesByGenre,
      provider: seriesByProvider
    }),
    [seriesByStatus, seriesByGenre, seriesByProvider]
  );

  const categoryNames = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(seriesMapByCategory).map((category) => [
          category,
          t(`series:dashboard.categories.${category}`)
        ])
      ),
    [seriesMapByCategory, t]
  );

  const filters = useMemo(
    () => getCategoryFilters(seriesMapByCategory, categoryNames),
    [seriesMapByCategory, categoryNames]
  );

  const [categoryFilters, setCategoryFilters] = useState(filters);
  const [seriesFiltered, setSeriesFiltered] = useState(series);

  const [seriesByStatusFiltered, seriesByGenreFiltered, seriesByProviderFiltered] = useMemo(
    () => getSeriesIdsByCategory(seriesFiltered, t),
    [seriesFiltered, t]
  );

  const seriesMapByCategoryFiltered: Record<
    string,
    Map<string, UserSeriesGetResponse["series"]>
  > = {
    status: seriesByStatusFiltered,
    genre: seriesByGenreFiltered,
    provider: seriesByProviderFiltered
  };

  const seriesIdsByCategoryFiltered = seriesMapByCategoryFiltered[category];

  useEffect(() => {
    // Les filtres n'existent qu'après le chargement des séries.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategoryFilters(filters);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeriesFiltered(series);
  }, [filters, series]);

  if (isPending) {
    return <LoadingState />;
  }

  if (dashboardSummaryQuery.isError) {
    return (
      <ErrorState
        error={dashboardSummaryQuery.error}
        onRetry={() => dashboardSummaryQuery.refetch()}
      />
    );
  }

  if (userSeriesQuery.isError) {
    return <ErrorState error={userSeriesQuery.error} onRetry={() => userSeriesQuery.refetch()} />;
  }

  if (series.length === 0) {
    return (
      <EmptyState
        title={t("series:dashboard.emptySeriesTitle")}
        description={t("series:dashboard.emptySeriesDescription")}
      />
    );
  }

  return (
    <PageContainer className="gap-18">
      <PageSection>
        <Heading level={1} className="uppercase">
          {t("user:stats.title")}
        </Heading>
        <UserDashboardSummaryWidget
          totalWatchedMinutes={dashboardSummaryQuery.data.totalWatchedMinutes}
          totalWatchedEpisodes={dashboardSummaryQuery.data.totalWatchedEpisodes}
          totalWatchedSeries={dashboardSummaryQuery.data.totalWatchedSeries}
        />
      </PageSection>

      <PageSection>
        <div className="flex w-full flex-row items-center gap-4">
          <Heading level={1} full={false} className="uppercase">
            {t("user:series.mySeries")}
          </Heading>
          <GroupDropdownMenu
            categories={categoryNames}
            category={t(`series:dashboard.categories.${category}`)}
            onCategoryChange={handleCategoryChange}
          />
          <FilterDrawer
            filters={categoryFilters}
            filterNames={categoryNames}
            onFiltersChange={setCategoryFilters}
            listToFilter={series}
            onListToFilterChange={setSeriesFiltered}
            filterFunction={filterSeries}
          />
        </div>
        <div className="flex flex-col gap-4">
          {Array.from(seriesIdsByCategoryFiltered.keys()).map((category) => (
            <UserSeriesSection
              key={category}
              series={seriesIdsByCategoryFiltered.get(category) ?? []}
              category={category}
            />
          ))}
        </div>
      </PageSection>
    </PageContainer>
  );
}
