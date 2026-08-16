import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { PageContainer } from "@/components/layout/pageContainer";
import { ScrollToTop } from "@/components/layout/scrollToTop";
import { Button } from "@/components/ui/button";
import SeriesDetails from "@/features/series/components/seriesDetails";
import { SeriesOverview } from "@/features/series/components/seriesOverview";
import { useSeries } from "@/features/series/hooks/useSeries";
import { useSeriesImport } from "@/features/series/hooks/useSeriesImportMutation";
import { getWatchProgress } from "@/features/user/utils/watchProgress";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";

export default function Series() {
    const { t } = useTranslation();
    const location = useLocation();
  const [searchParams] = useSearchParams();

  const seriesId = Number(searchParams.get("id")?.trim() ?? "");
  const tmdbId = location.state?.tmdbId as number | undefined;

  const seriesQuery = useSeries(seriesId);
  const seriesImportMutation = useSeriesImport();
  
  const [view, setView] = useState<"overview" | "details">("overview");
  
  useEffect(() => {
      if (seriesId || tmdbId === undefined) {
          return;
        }
        
        seriesImportMutation.mutate(tmdbId);
    }, [seriesId, tmdbId, seriesImportMutation]);
    
    if (!seriesId && tmdbId === undefined) {
        return <ErrorState error={t("errors:invalidRequest")} />;
    }
    
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
    console.log(watchProgress);

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
