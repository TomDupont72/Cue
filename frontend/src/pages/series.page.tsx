import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import SeriesDetails from "@/features/series/components/seriesDetails";
import { SeriesOverview } from "@/features/series/components/seriesOverview";
import { useSeriesImport } from "@/features/series/hooks/useSeriesImport";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Series() {
  type SeriesView = "overview" | "details";

  const [view, setView] = useState<SeriesView>("overview");

  const [searchParams] = useSearchParams();

  const tmdbId = Number(searchParams.get("id")?.trim() ?? "");

  const seriesImportQuery = useSeriesImport(tmdbId);

  if (seriesImportQuery.isPending) {
    return <LoadingState />;
  }

  if (seriesImportQuery.isError) {
    return (
      <ErrorState error={seriesImportQuery.error} onRetry={() => seriesImportQuery.refetch()} />
    );
  }

  const { series, userSeries } = seriesImportQuery.data;

  return (
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
          <SeriesOverview series={series} userSeries={userSeries} />
        ) : (
          <SeriesDetails id={series.id} />
        )}
      </div>
    </Container>
  );
}
