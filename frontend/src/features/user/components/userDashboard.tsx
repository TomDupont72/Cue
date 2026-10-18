import { useTranslation } from "react-i18next";

import { EmptyState } from "@/components/feedback/emptyState";
import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { Heading } from "@/components/layout/heading";
import { PageContainer } from "@/components/layout/pageContainer";
import { PageSection } from "@/components/layout/pageSection";
import UserDashboardSummaryWidget from "@/features/user/components/userDashboardSummaryWidget";
import { UserSeriesLibrary } from "@/features/user/components/userSeriesLibrary";
import { useUserDashboardSummary } from "@/features/user/hooks/useUserDashboardSummary";
import { useUserSeries } from "@/features/user/hooks/useUserSeries";
import { useUserSeriesSearchParams } from "@/features/user/hooks/useUserSeriesSearchParams";

export default function UserDashboard() {
  const { t } = useTranslation();

  const searchState = useUserSeriesSearchParams();
  const dashboardSummaryQuery = useUserDashboardSummary();
  const userSeriesQuery = useUserSeries();

  if (!searchState.success) {
    return <ErrorState error={t("errors:invalidRequest")} />;
  }

  if (dashboardSummaryQuery.isPending || userSeriesQuery.isPending) {
    return <LoadingState />;
  }

  if (dashboardSummaryQuery.isError) {
    return (
      <ErrorState
        error={dashboardSummaryQuery.error}
        onRetry={() => void dashboardSummaryQuery.refetch()}
      />
    );
  }

  if (userSeriesQuery.isError) {
    return (
      <ErrorState error={userSeriesQuery.error} onRetry={() => void userSeriesQuery.refetch()} />
    );
  }

  if (userSeriesQuery.data.series.length === 0) {
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

      <UserSeriesLibrary
        series={userSeriesQuery.data.series}
        groupBy={searchState.data.groupBy}
        filters={searchState.data.filters}
        onGroupByChange={searchState.setGroupBy}
        onFiltersChange={searchState.setFilters}
      />
    </PageContainer>
  );
}
