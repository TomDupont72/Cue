import { useTranslation } from "react-i18next";

import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { PageContainer } from "@/components/layout/pageContainer";
import SeriesDataPieChart from "@/features/user/components/seriesDataPieChart";
import { useUserSeries } from "@/features/user/hooks/useUserSeries";
import { useStatsState } from "@/pages/stats/useStatsState";

export default function StatsContent() {
  const { t } = useTranslation();

  const statsState = useStatsState();
  const userSeriesQuery = useUserSeries();

  if (!statsState.success) {
    return <ErrorState error={t("errors:invalidRequest")} />;
  }

  if (userSeriesQuery.isPending) {
    return <LoadingState />;
  }

  if (userSeriesQuery.isError) {
    return (
      <ErrorState error={userSeriesQuery.error} onRetry={() => void userSeriesQuery.refetch()} />
    );
  }

  return (
    <PageContainer>
      <SeriesDataPieChart
        series={userSeriesQuery.data.series}
        groupBy={statsState.data.groupBy}
        filters={statsState.data.filters}
        metric={statsState.data.metric}
        limit={statsState.data.limit}
        onGroupByChange={statsState.setGroupBy}
        onMetricChange={statsState.setMetric}
        onLimitChange={statsState.setLimit}
      />
    </PageContainer>
  );
}
