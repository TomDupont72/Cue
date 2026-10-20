import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { PageContainer } from "@/components/layout/pageContainer";
import { ScrollToTop } from "@/components/layout/scrollToTop";
import { Button } from "@/components/ui/button";
import SeriesDetails from "@/features/series/components/seriesDetails";
import { SeriesOverview } from "@/features/series/components/seriesOverview";
import { useSeries } from "@/features/series/hooks/useSeries";
import { useSeriesImportMutation } from "@/features/series/hooks/useSeriesImportMutation";
import { getWatchProgress } from "@/features/user/utils/watchProgress";
import { useSeriesState } from "@/pages/series/useSeriesState";

export default function SeriesContent() {
  const { t } = useTranslation();

  const seriesState = useSeriesState();

  const seriesQuery = useSeries(seriesState.data?.id ?? 0, seriesState.data?.id !== undefined);
  const seriesImportMutation = useSeriesImportMutation();

  const [view, setView] = useState<"overview" | "details">("overview");

  useEffect(() => {
    if (!seriesQuery.isEnabled && seriesState.data?.tmdbId) {
      seriesImportMutation.mutate(seriesState.data.tmdbId);
    }
  }, [seriesQuery.isEnabled, seriesState.data?.tmdbId, seriesImportMutation]);

  if (!seriesState.success || (!seriesState.data?.tmdbId && !seriesState.data?.id)) {
    return <ErrorState error={t("errors:invalidRequest")} />;
  }

  if (seriesQuery.isPending || seriesImportMutation.isPending) {
    return <LoadingState />;
  }

  if (seriesQuery.isError) {
    return <ErrorState error={seriesQuery.error} onRetry={() => seriesQuery.refetch()} />;
  }

  if (seriesImportMutation.isError && seriesState.data?.tmdbId) {
    return (
      <ErrorState
        error={seriesImportMutation.error}
        onRetry={() => seriesImportMutation.mutate(seriesState.data.tmdbId!)}
      />
    );
  }

  const { episodes, userEpisodes, seasons, series, userSeries, seriesProviders, seriesGenres } =
    seriesQuery.data;

  const watchProgress = userSeries
    ? getWatchProgress(userSeries?.watchCount, series.numberOfEpisodes)
    : undefined;

  return (
    <>
      <ScrollToTop />
      <PageContainer className="gap-4 max-w-4xl">
        <div className="grid w-full grid-cols-2 gap-2">
          <Button
            variant={view === "overview" ? "secondary" : "ghost"}
            onClick={() => setView("overview")}
            className="text-lg font-bold"
          >
            {t("series:tabs.about").toUpperCase()}
          </Button>

          <Button
            variant={view === "details" ? "secondary" : "ghost"}
            onClick={() => setView("details")}
            className="text-lg font-bold"
          >
            {t("series:tabs.episodes").toUpperCase()}
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-8">
          {view === "overview" ? (
            <SeriesOverview
              series={series}
              userSeries={userSeries}
              seriesProviders={seriesProviders}
              seriesGenres={seriesGenres}
              watchProgress={watchProgress}
            />
          ) : (
            <SeriesDetails
              id={series.id}
              episodes={episodes}
              userEpisodes={userEpisodes}
              seasons={seasons}
              backdropPath={series.backdropPath}
            />
          )}
        </div>
      </PageContainer>
    </>
  );
}
