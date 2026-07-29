import { LoadingState } from "@/components/feedback/loadingState";
import SeriesDisplay from "@/features/series/components/seriesDisplay";
import { useEffect, useRef } from "react";
import { STATUS_TEXT_MAPPING, type UserSeriesStatus } from "../constants/userSeriesStatus";
import { useUserSeries } from "../hooks/useUserSeriesGet";

type UserSeriesSectionProps = {
  status: UserSeriesStatus;
};

export function UserSeriesSection({ status }: UserSeriesSectionProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const query = useUserSeries(status);
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "300px"
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (query.isPending || query.isError || items.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">{STATUS_TEXT_MAPPING[status]}</h2>

      <div className="h-px w-full bg-border" />

      <SeriesDisplay
        seriesData={items.map((item) => item.seriesDetails)}
        userSeriesData={items}
        isProgress
      />

      {query.hasNextPage && (
        <div ref={loadMoreRef} className="flex h-24 items-center justify-center">
          {query.isFetchingNextPage && <LoadingState />}
        </div>
      )}
    </section>
  );
}
