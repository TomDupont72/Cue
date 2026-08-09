import { Search } from "lucide-react";
import { useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/feedback/emptyState";
import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import type { SeriesCardData } from "../types/series.types";
import { useSeriesImportMutation } from "../hooks/useSeriesImportMutation";
import { useSeriesSearch } from "../hooks/useSeriesSearch";
import Paginator from "@/components/layout/paginator";
import SeriesDisplay from "./seriesDisplay";

export function SeriesSearchResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const importPendingRef = useRef(false);
  const selectedTmdbIdRef = useRef<number | null>(null);

  const query = searchParams.get("query")?.trim() ?? "";
  const page = Number(searchParams.get("page")?.trim() ?? 1);

  const seriesQuery = useSeriesSearch(query, page);
  const seriesImportMutation = useSeriesImportMutation();

  function handleSeriesClick(series: SeriesCardData) {
    startSeriesImport(series.tmdbId);
  }

  function startSeriesImport(tmdbId: number) {
    if (importPendingRef.current) {
      return;
    }

    importPendingRef.current = true;
    selectedTmdbIdRef.current = tmdbId;

    seriesImportMutation.mutate(tmdbId, {
      onSuccess: (result) => {
        navigate(`/series?seriesId=${result.series.id}`);
      },
      onSettled: () => {
        importPendingRef.current = false;
      }
    });
  }

  function retrySeriesImport() {
    const tmdbId = selectedTmdbIdRef.current;

    if (tmdbId !== null) {
      startSeriesImport(tmdbId);
    }
  }

  function handlePageChange(nextPage: number) {
    setSearchParams({
      query,
      page: String(nextPage)
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!query) {
    return (
      <EmptyState
        icon={<Search className="size-8" />}
        title="Recherche une série"
        description="Entre le nom d'une série pour afficher les résultats."
      />
    );
  }

  if (seriesImportMutation.isPending) {
    return <LoadingState />;
  }

  if (seriesImportMutation.isError) {
    return <ErrorState error={seriesImportMutation.error} onRetry={retrySeriesImport} />;
  }

  if (seriesQuery.isPending) {
    return <LoadingState />;
  }

  if (seriesQuery.isError) {
    return <ErrorState error={seriesQuery.error} onRetry={() => seriesQuery.refetch()} />;
  }

  if (seriesQuery.data.results.length === 0) {
    return (
      <EmptyState
        icon={<Search className="size-8" />}
        title="Aucun résultat"
        description={`Aucune série trouvée pour « ${query} ».`}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {seriesQuery.data.totalResults} résultat
          {seriesQuery.data.totalResults > 1 ? "s" : ""}
        </p>
      </div>

      <SeriesDisplay seriesData={seriesQuery.data.results} onSeriesClick={handleSeriesClick} />

      <Paginator
        currentPage={page}
        pageNumber={seriesQuery.data.totalPages}
        setCurrentPage={handlePageChange}
      />
    </div>
  );
}
