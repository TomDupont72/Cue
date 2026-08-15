import { LoadingState } from "@/components/feedback/loadingState";
import SeriesDisplay from "@/features/series/components/seriesDisplay";
import { useEffect, useRef } from "react";
import type { UserSeriesStatus } from "../constants/userSeriesStatus";
import { useUserSeries } from "../hooks/useUserSeries";
import { useTranslation } from "react-i18next";

type UserSeriesSectionProps = {
  status: UserSeriesStatus;
};

export function UserSeriesSection({ status }: UserSeriesSectionProps) {
  const { t } = useTranslation();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const query = useUserSeries(undefined, status);
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
      <h2 className="text-lg font-bold">
        {t(`user:series.status.${status}.section`).toUpperCase()}
      </h2>

      <div className="h-px w-full bg-border" />

      <SeriesDisplay
        series={items.map((item) => item.seriesDetails)}
        userSeries={items}
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
