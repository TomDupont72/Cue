import { LoadingState } from "@/components/feedback/loadingState";
import { Container } from "@/components/layout/container";
import { UserSeriesSection } from "@/features/user/components/userSeriesSection";
import { USER_SERIES_STATUS } from "@/features/user/constants/userSeriesStatus";
import { queryKeys } from "@/lib/queryKeys";
import { useIsFetching } from "@tanstack/react-query";

export default function Dashboard() {
  const initialFetchingCount = useIsFetching({
    queryKey: queryKeys.userSeries.all,
    predicate: (query) => query.state.data === undefined
  });
  const isInitialLoading = initialFetchingCount > 0;

  return (
    <Container className="flex flex-1 flex-col py-8">
      {isInitialLoading && <LoadingState />}

      <div className={isInitialLoading ? "hidden" : "flex flex-col gap-4"}>
        {Object.values(USER_SERIES_STATUS).map((status) => (
          <UserSeriesSection key={status} status={status} />
        ))}
      </div>
    </Container>
  );
}
