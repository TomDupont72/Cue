import { useTranslation } from "react-i18next";

import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { PageContainer } from "@/components/layout/pageContainer";
import { PageSection } from "@/components/layout/pageSection";
import UserEpisodesDataAreaChart from "@/features/user/components/userEpisodesDataAreaChart";
import UserSeriesDataDonutChart from "@/features/user/components/UserSeriesDataDonutChart";
import UserSeriesDataPieChart from "@/features/user/components/userSeriesDataPieChart";
import { useUserEpisodesActivity } from "@/features/user/hooks/useUserEpisodesActivity";
import { useUserSeries } from "@/features/user/hooks/useUserSeries";
import { useStatsState } from "@/pages/stats/useStatsState";

export default function StatsContent() {
  const { t } = useTranslation();

  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

  const statsState = useStatsState();
  const userSeriesQuery = useUserSeries();
  const userEpisodesActivityQuery = useUserEpisodesActivity(timeZone, statsState.data?.seriesIds);

  if (!statsState.success) {
    return <ErrorState error={t("errors:invalidRequest")} />;
  }

  if (userSeriesQuery.isPending || userEpisodesActivityQuery.isPending) {
    return <LoadingState />;
  }

  if (userSeriesQuery.isError) {
    return <ErrorState error={userSeriesQuery.error} onRetry={() => userSeriesQuery.refetch()} />;
  }

  if (userEpisodesActivityQuery.isError) {
    return (
      <ErrorState
        error={userEpisodesActivityQuery.error}
        onRetry={() => userEpisodesActivityQuery.refetch()}
      />
    );
  }

  return (
    <PageContainer>
      <PageSection className="grid grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
        <div className="min-w-0">
          <UserSeriesDataPieChart
            series={userSeriesQuery.data.series}
            groupBy={statsState.data.groupBy}
            filters={statsState.data.filters}
            metric={statsState.data.pieMetric}
            limit={statsState.data.limit}
            onGroupByChange={statsState.setGroupBy}
            onMetricChange={statsState.setPieMetric}
            onLimitChange={statsState.setLimit}
          />
        </div>
        <div className="min-w-0">
          <UserSeriesDataDonutChart series={userSeriesQuery.data.series} />
        </div>
        <div className="col-span-1 min-w-0 md:col-span-2">
          <UserEpisodesDataAreaChart
            series={userSeriesQuery.data.series}
            episodesActivity={userEpisodesActivityQuery.data.activity}
            metric={statsState.data.areaMetric}
            period={statsState.data.areaPeriod}
            seriesIds={statsState.data.seriesIds}
            onMetricChange={statsState.setAreaMetric}
            onPeriodChange={statsState.setAreaPeriod}
            onSeriesIdsChange={statsState.setSeriesIds}
          />
        </div>
      </PageSection>
    </PageContainer>
  );
}
