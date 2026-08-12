import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { Container } from "@/components/layout/container";
import { ScrollToTop } from "@/components/layout/scrollToTop";
import { Button } from "@/components/ui/button";
import SeriesDetails from "@/features/series/components/seriesDetails";
import { SeriesOverview } from "@/features/series/components/seriesOverview";
import { useSeries } from "@/features/series/hooks/useSeries";
import { useSeriesImport } from "@/features/series/hooks/useSeriesImportMutation";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

export default function Series() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const seriesId = Number(searchParams.get("id")?.trim() ?? "");
  const tmdbId = location.state?.tmdbId as number | undefined;

  const seriesQuery = useSeries(seriesId);
  const seriesImportMutation = useSeriesImport()

  if (!seriesId && tmdbId === undefined) {
    return <ErrorState error="Requête invalide" />;
  }

  useEffect(() => {
    if (seriesId || tmdbId === undefined) {
      return;
    }

    seriesImportMutation.mutate(tmdbId);
  }, [seriesId, tmdbId]);

  type SeriesView = "overview" | "details";

  const [view, setView] = useState<SeriesView>("overview");

  if (seriesQuery.isPending) {
    return <LoadingState />;
  }

  if (seriesQuery.isError) {
    return <ErrorState error={seriesQuery.error} onRetry={() => seriesQuery.refetch()} />;
  }

  const { series, userSeries } = seriesQuery.data;

  const watchProgress = userSeries
    ? (userSeries.watchCount / series.numberOfEpisodes) * 100
    : undefined;

  return (
    <>
      <ScrollToTop />
      <Container className="flex flex-1 flex-col py-8 gap-4">
        <div className="grid w-full grid-cols-2 gap-2">
          <Button
            variant={view === "overview" ? "secondary" : "ghost"}
            onClick={() => setView("overview")}
            className="text-lg font-bold"
          >
            À PROPOS
          </Button>

          <Button
            variant={view === "details" ? "secondary" : "ghost"}
            onClick={() => setView("details")}
            className="text-lg font-bold"
          >
            ÉPISODES
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-8">
          {view === "overview" ? (
            <SeriesOverview
              series={series}
              userSeries={userSeries}
              isProgress={userSeries !== null}
              watchProgress={watchProgress}
            />
          ) : (
            <SeriesDetails id={series.id} />
          )}
        </div>
      </Container>
    </>
  );
}