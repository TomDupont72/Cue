import { EmptyState } from "@/components/feedback/emptyState";
import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { Container } from "@/components/layout/container";
import SeriesDisplay from "@/features/series/components/seriesDisplay";
import {
  STATUS_TEXT_MAPPING,
  USER_SERIES_STATUS
} from "@/features/user/constants/userSeriesStatus";
import { useUserSeries } from "@/features/user/hooks/useUserSeriesGet";
import { useEffect, useRef } from "react";

export default function Dashboard() {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const seriesQuery = useUserSeries();

  const items = seriesQuery.data?.pages.flatMap((page) => page.items) ?? [];

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element || !seriesQuery.hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && seriesQuery.hasNextPage && !seriesQuery.isFetchingNextPage) {
          seriesQuery.fetchNextPage();
        }
      },
      {
        rootMargin: "300px"
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [seriesQuery.fetchNextPage, seriesQuery.hasNextPage, seriesQuery.isFetchingNextPage]);

  if (seriesQuery.isPending) {
    return <LoadingState />;
  }

  if (seriesQuery.isError) {
    return <ErrorState error={seriesQuery.error} onRetry={() => seriesQuery.refetch()} />;
  }

  if (items.length === 0) {
    return <EmptyState title="Aucun résultat" description={`Pas encore de séries ajoutées.`} />;
  }

  return (
    <Container className="flex flex-1 flex-col py-8">
      <div className="flex flex-col gap-4">
        {Object.values(USER_SERIES_STATUS).map((status) => {
          const seriesFiltered = items.filter((series) => series.status === status);

          if (seriesFiltered.length === 0) {
            return null;
          }

          return (
            <section key={status} className="flex flex-col gap-4">
              <h2 className="text-lg font-bold">{STATUS_TEXT_MAPPING[status]}</h2>

              <div className="h-px w-full bg-border" />

              <SeriesDisplay seriesData={seriesFiltered.map((series) => series.seriesDetails)} />
            </section>
          );
        })}

        {seriesQuery.hasNextPage && (
          <div ref={loadMoreRef} className="flex h-24 items-center justify-center">
            {seriesQuery.isFetchingNextPage && <LoadingState />}
          </div>
        )}
      </div>
    </Container>
  );
}
