import { EmptyState } from "@/components/feedback/emptyState";
import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { useUserDashboardSummary } from "@/features/user/hooks/useUserDashboardSummary";
import { useUserSeries } from "@/features/user/hooks/useUserSeries";
import { userDashboardSearchParamsSchema } from "@/features/user/schemas/user.schemas";
import { useTranslation } from "react-i18next";
import DashboardContent from "@/pages/dashboard/dashboardContent";
import { useSearchParams } from "react-router-dom";

export default function Dashboard() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const dashboardParams = userDashboardSearchParamsSchema.safeParse({
    groupBy: searchParams.get("group"),
    statuses: searchParams.getAll("statuses"),
    genres: searchParams.getAll("genres"),
    providers: searchParams.getAll("providers")
  });

  console.log(dashboardParams);

  const dashboardSummaryQuery = useUserDashboardSummary();
  const userSeriesQuery = useUserSeries();

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

  if (!dashboardParams.success) {
    return <ErrorState error={t("errors:invalidRequest")} />;
  }

  const userSeries = userSeriesQuery.data;
  const dashboardSummary = dashboardSummaryQuery.data;

  if (userSeries.series.length === 0) {
    return (
      <EmptyState
        title={t("series:dashboard.emptySeriesTitle")}
        description={t("series:dashboard.emptySeriesDescription")}
      />
    );
  }

  return (
    <DashboardContent
      userSeries={userSeries}
      dashboardSummary={dashboardSummary}
      {...dashboardParams.data}
    />
  );
}
