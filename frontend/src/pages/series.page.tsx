import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { PageContainer } from "@/components/layout/pageContainer";
import { ScrollToTop } from "@/components/layout/scrollToTop";
import { Button } from "@/components/ui/button";
import SeriesDetails from "@/features/series/components/seriesDetails";
import { SeriesOverview } from "@/features/series/components/seriesOverview";
import { useSeries } from "@/features/series/hooks/useSeries";
import { useSeriesImport } from "@/features/series/hooks/useSeriesImportMutation";
import { seriesGetParamsSchema } from "@/features/series/schemas/series.schemas";
import { getWatchProgress } from "@/features/user/utils/watchProgress";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";

export default function Series() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const seriesParams = seriesGetParamsSchema.safeParse({ id: searchParams.get("id") });
  const tmdbId = location.state?.tmdbId as number | undefined;

  if (seriesParams.success) {
    return <SeriesContent key={seriesParams.data.id} seriesId={seriesParams.data.id} />;
  }

  if (tmdbId !== undefined) {
    return <SeriesImport key={tmdbId} tmdbId={tmdbId} />;
  }

  return <InvalidSeries />;
}

function InvalidSeries() {
  const { t } = useTranslation();

  return <ErrorState error={t("errors:invalidRequest")} />;
}

type SeriesImportProps = {
  tmdbId: number;
};

function SeriesImport({ tmdbId }: SeriesImportProps) {
  const importStartedRef = useRef(false);
  const { mutate, isError, error } = useSeriesImport();

  const importSeries = useCallback(() => {
    mutate(tmdbId);
  }, [mutate, tmdbId]);

  useEffect(() => {
    if (importStartedRef.current) {
      return;
    }

    importStartedRef.current = true;
    importSeries();
  }, [importSeries]);

  if (isError) {
    return <ErrorState error={error} onRetry={importSeries} />;
  }

  return <LoadingState />;
}

type SeriesContentProps = {
  seriesId: number;
};

function SeriesContent({ seriesId }: SeriesContentProps) {
  const { t } = useTranslation();
  const seriesQuery = useSeries(seriesId);
  const [view, setView] = useState<"overview" | "details">("overview");

  if (seriesQuery.isPending) {
    return <LoadingState />;
  }

  if (seriesQuery.isError) {
    return <ErrorState error={seriesQuery.error} onRetry={() => seriesQuery.refetch()} />;
  }

  const { episodes, userEpisodes, seasons, series, userSeries } = seriesQuery.data;

  const watchProgress = userSeries
    ? getWatchProgress(userSeries?.watchCount, series.numberOfEpisodes)
    : undefined;

  return (
    <>
      <ScrollToTop />
      <PageContainer className="gap-4">
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
            <SeriesOverview series={series} userSeries={userSeries} watchProgress={watchProgress} />
          ) : (
            <SeriesDetails
              id={series.id}
              episodes={episodes}
              userEpisodes={userEpisodes}
              seasons={seasons}
            />
          )}
        </div>
      </PageContainer>
    </>
  );
}
