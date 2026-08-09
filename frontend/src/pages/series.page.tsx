import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { Container } from "@/components/layout/container";
import { ScrollToTop } from "@/components/layout/scrollToTop";
import { Button } from "@/components/ui/button";
import SeriesDetails from "@/features/series/components/seriesDetails";
import { SeriesOverview } from "@/features/series/components/seriesOverview";
import { useSeries } from "@/features/series/hooks/useSeries";
import { useSeriesImportMutation } from "@/features/series/hooks/useSeriesImportMutation";
import {
  seriesGetParamsSchema,
  seriesImportPostBodySchema
} from "@/features/series/schemas/series.schemas";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const invalidSeriesLinkError = new Error("Le lien vers cette série est invalide.");

export default function Series() {
  const [searchParams] = useSearchParams();
  const seriesIdParam = searchParams.get("seriesId");

  if (seriesIdParam !== null) {
    if (!seriesIdParam.trim()) {
      return <InvalidSeriesLink />;
    }

    const seriesParams = seriesGetParamsSchema.safeParse({ id: seriesIdParam });

    if (!seriesParams.success) {
      return <InvalidSeriesLink />;
    }

    return (
      <SeriesContent
        key={seriesParams.data.id}
        seriesId={seriesParams.data.id}
        scrollDependency={seriesParams.data.id}
      />
    );
  }

  const tmdbIdParam = searchParams.get("id");

  if (tmdbIdParam === null || !tmdbIdParam.trim()) {
    return <InvalidSeriesLink />;
  }

  const importBody = seriesImportPostBodySchema.safeParse({ tmdbId: tmdbIdParam });

  if (!importBody.success) {
    return <InvalidSeriesLink />;
  }

  return <LegacySeriesImport key={importBody.data.tmdbId} tmdbId={importBody.data.tmdbId} />;
}

function InvalidSeriesLink() {
  return <ErrorState error={invalidSeriesLinkError} />;
}

type LegacySeriesImportProps = {
  tmdbId: number;
};

function LegacySeriesImport({ tmdbId }: LegacySeriesImportProps) {
  const navigate = useNavigate();
  const importStartedRef = useRef(false);
  const { mutate, isError, error } = useSeriesImportMutation();

  const importSeries = useCallback(() => {
    mutate(tmdbId, {
      onSuccess: ({ series }) => {
        navigate(`/series?seriesId=${series.id}`, { replace: true });
      }
    });
  }, [mutate, navigate, tmdbId]);

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
  scrollDependency: number;
};

function SeriesContent({ seriesId, scrollDependency }: SeriesContentProps) {
  type SeriesView = "overview" | "details";

  const [view, setView] = useState<SeriesView>("overview");
  const seriesQuery = useSeries(seriesId);

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
      <ScrollToTop dependency={scrollDependency} />
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
