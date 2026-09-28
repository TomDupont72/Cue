import { EmptyState } from "@/components/feedback/emptyState";
import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import GroupButton from "@/components/layout/groupButton";
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
import { useMemo, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";

const getSeriesIdsByCategory = (series: UserSeriesGetResponse["series"], t: TFunction) => {
    const seriesByStatus = new Map()
    for (const serie of series) {
        const statusName = t(`user:series.status.${USER_SERIES_STATUS[serie.status]}.section`)
        const currentValue = seriesByStatus.get(statusName) ?? []
        seriesByStatus.set(statusName, [...currentValue, serie])
    }

    const seriesIdsByStatusOrder = [
        t(`user:series.status.${USER_SERIES_STATUS.WATCHING}.section`),
        t(`user:series.status.${USER_SERIES_STATUS.PAUSED}.section`),
        t(`user:series.status.${USER_SERIES_STATUS.PLANNED}.section`),
        t(`user:series.status.${USER_SERIES_STATUS.COMPLETED}.section`),
        t(`user:series.status.${USER_SERIES_STATUS.DROPPED}.section`),
    ]

    const seriesByStatusSorted = new Map(Array.from(seriesByStatus.entries()).sort(
        ([keyA], [keyB]) => seriesIdsByStatusOrder.indexOf(keyA) - seriesIdsByStatusOrder.indexOf(keyB))
    )

    const seriesByGenre = new Map()
    for (const serie of series) {
        for (const genre of serie.seriesGenres) {
            const genreName = t(`genre:${GENRE_KEY_BY_NAME[genre.name] ?? "OTHER"}`)
            const currentValue = seriesByGenre.get(genreName) ?? []
            seriesByGenre.set(genreName, [...currentValue, serie])
        }
    }

    const seriesByGenreSorted = new Map(Array.from(seriesByGenre.entries()).sort(
        ([keyA], [keyB]) => keyA.localeCompare(keyB))
    )

    const seriesByProvider = new Map()
    for (const serie of series) {
        for (const provider of serie.seriesProviders) {
            const currentValue = seriesByProvider.get(provider.name) ?? []
            seriesByProvider.set(provider.name, [...currentValue, serie])
        }
    }

    const seriesByProviderSorted = new Map(Array.from(seriesByProvider.entries()).sort(
        ([keyA], [keyB]) => keyA.localeCompare(keyB)
    ))

    return [seriesByStatusSorted, seriesByGenreSorted, seriesByProviderSorted]
}

export default function Dashboard() {
  const { t } = useTranslation();

  const dashboardSummaryQuery = useUserDashboardSummary();

  const userSeriesQuery = useUserSeries();
  const series = userSeriesQuery.data?.series ?? [];

  const isPending = userSeriesQuery.isPending || dashboardSummaryQuery.isPending;

  const [category, setCategory] = useState<string>("Statut")

  const [, startTransition] = useTransition();

    const handleCategoryChange = (value: string) => {
    startTransition(() => setCategory(value));
    };

  const categories = [
    t("series:dashboard.categories.status"),
    t("series:dashboard.categories.genre"),
    t("series:dashboard.categories.provider")
  ]

  const [seriesByStatus, seriesByGenre, seriesByProvider] = useMemo(() => getSeriesIdsByCategory(series, t), [series])

  const seriesMapByCategory: Record<string, Map<string, UserSeriesGetResponse["series"]>> = {
    [categories[0]]: seriesByStatus,
    [categories[1]]: seriesByGenre,
    [categories[2]]: seriesByProvider
  }

  const seriesIdsByCategory = seriesMapByCategory[category]

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
        <div className="flex w-full flex-row items-center gap-2">
          <Heading level={1} full={false} className="uppercase">
            {t("user:series.mySeries")}
          </Heading>
          <GroupButton categories={categories} category={category} onCategoryChange={handleCategoryChange} />
        </div>
        <div className="flex flex-col gap-4">
          {Array.from(seriesIdsByCategory.keys()).map((category) => (
            <UserSeriesSection
              key={category}
              series={seriesIdsByCategory.get(category) ?? []}
              category={category}
            />
          ))}
        </div>
      </PageSection>
    </PageContainer>
  );
}
