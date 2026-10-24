import { useTranslation } from "react-i18next";

import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { PageContainer } from "@/components/layout/pageContainer";
import { PageSection } from "@/components/layout/pageSection";
import UserSeriesDataDonutChart from "@/features/user/components/UserSeriesDataDonutChart";
import UserSeriesDataPieChart from "@/features/user/components/userSeriesDataPieChart";
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
      <PageSection className="grid grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
        <UserSeriesDataPieChart
          series={userSeriesQuery.data.series}
          groupBy={statsState.data.groupBy}
          filters={statsState.data.filters}
          metric={statsState.data.metric}
          limit={statsState.data.limit}
          onGroupByChange={statsState.setGroupBy}
          onMetricChange={statsState.setMetric}
          onLimitChange={statsState.setLimit}
        />
        <UserSeriesDataDonutChart series={userSeriesQuery.data.series} />
      </PageSection>
    </PageContainer>
  );
}
