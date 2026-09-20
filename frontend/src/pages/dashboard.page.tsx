import { EmptyState } from "@/components/feedback/emptyState";
import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { Heading } from "@/components/layout/heading";
import { PageContainer } from "@/components/layout/pageContainer";
import { PageSection } from "@/components/layout/pageSection";
import UserDashboardSummaryWidget from "@/features/user/components/userDashboardSummaryWidget";
import { UserSeriesSection } from "@/features/user/components/userSeriesSection";
import { USER_SERIES_STATUS } from "@/features/user/constants/userSeriesStatus";
import { useUserDashboardSummary } from "@/features/user/hooks/useUserDashboardSummary";
import { useUserSeries } from "@/features/user/hooks/useUserSeries";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation();

  const dashboardSummaryQuery = useUserDashboardSummary();

  const userSeriesQuery = useUserSeries();
  const series = userSeriesQuery.data?.series ?? [];

  const isPending = userSeriesQuery.isPending || dashboardSummaryQuery.isPending;

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
        <Heading level={1} className="uppercase">
          {t("user:series.mySeries")}
        </Heading>
        <div className="flex flex-col gap-4">
          {Object.values(USER_SERIES_STATUS).map((status) => (
            <UserSeriesSection
              key={status}
              series={series.filter((serie) => serie.status === status)}
            />
          ))}
        </div>
      </PageSection>
    </PageContainer>
  );
}
