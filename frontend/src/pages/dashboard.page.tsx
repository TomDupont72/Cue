import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { Container } from "@/components/layout/container";
import UserDashboardSummaryWidget from "@/features/user/components/userDashboardSummaryWidget";
import { UserSeriesSection } from "@/features/user/components/userSeriesSection";
import { USER_SERIES_STATUS } from "@/features/user/constants/userSeriesStatus";
import { useDashboardSummary } from "@/features/user/hooks/useDashboardSummary";
import { queryKeys } from "@/lib/queryKeys";
import { useIsFetching } from "@tanstack/react-query";

export default function Dashboard() {
  const initialFetchingCount = useIsFetching({
    queryKey: queryKeys.userSeries.all,
    predicate: (query) => query.state.data === undefined
  });

  const dashboardSummaryQuery = useDashboardSummary();

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

  console.log(dashboardSummaryQuery.data);

  return (
    <Container className="flex flex-1 flex-col py-8 items-center gap-18">
      <section className="w-full flex flex-col items-center gap-6">
        <h1 className="w-full text-left font-bold text-3xl">STATISTIQUES</h1>
        <UserDashboardSummaryWidget
          totalWatchedMinutes={dashboardSummaryQuery.data.totalWatchedMinutes}
          totalWatchedEpisodes={dashboardSummaryQuery.data.totalWatchedEpisodes}
          totalWatchedSeries={dashboardSummaryQuery.data.totalWatchedSeries}
        />
      </section>

      <section className="w-full flex flex-col items-center gap-6">
        <h1 className="w-full text-left font-bold text-3xl">MES SÉRIES</h1>
        <div className={isPending ? "hidden" : "flex flex-col gap-4"}>
          {Object.values(USER_SERIES_STATUS).map((status) => (
            <UserSeriesSection key={status} status={status} />
          ))}
        </div>
      </section>
    </Container>
  );
}
