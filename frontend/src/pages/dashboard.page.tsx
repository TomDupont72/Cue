import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { Heading } from "@/components/layout/heading";
import { PageContainer } from "@/components/layout/pageContainer";
import { PageSection } from "@/components/layout/pageSection";
import UserDashboardSummaryWidget from "@/features/user/components/userDashboardSummaryWidget";
import { UserSeriesSection } from "@/features/user/components/userSeriesSection";
import { USER_SERIES_STATUS } from "@/features/user/constants/userSeriesStatus";
import { useUserDashboardSummary } from "@/features/user/hooks/useUserDashboardSummary";
import { queryKeys } from "@/lib/queryKeys";
import { useIsFetching } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation();
 
  const dashboardSummaryQuery = useUserDashboardSummary();

  const initialFetchingCount = useIsFetching({
    queryKey: queryKeys.userSeries.all,
    predicate: (query) => query.state.data === undefined
  });

  const isPending = initialFetchingCount > 0 || dashboardSummaryQuery.isPending;

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
        <div className={isPending ? "hidden" : "flex flex-col gap-4"}>
          {Object.values(USER_SERIES_STATUS).map((status) => (
            <UserSeriesSection key={status} status={status} />
          ))}
        </div>
      </PageSection>
    </PageContainer>
  );
}
