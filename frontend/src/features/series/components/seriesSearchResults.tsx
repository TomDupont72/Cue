import { Search } from "lucide-react";
import { useRef } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/feedback/emptyState";
import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import {
  SERIES_SEARCH_QUERY_MAX_LENGTH,
  SERIES_SEARCH_QUERY_MIN_LENGTH,
  seriesSearchPageSchema,
  seriesSearchQuerySchema
} from "../schemas/series.schemas";
import type { SeriesCardData } from "../types/series.types";
import { useSeriesImportMutation } from "../hooks/useSeriesImportMutation";
import { useSeriesSearch } from "../hooks/useSeriesSearch";
import Paginator from "@/components/layout/paginator";
import SeriesDisplay from "./seriesDisplay";

export function SeriesSearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query")?.trim() ?? "";
  const pageResult = seriesSearchPageSchema.safeParse(searchParams.get("page") ?? undefined);

  if (!pageResult.success) {
    const normalizedSearchParams = new URLSearchParams(searchParams);
    normalizedSearchParams.set("page", "1");

    return <Navigate replace to={{ search: `?${normalizedSearchParams.toString()}` }} />;
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

  if (query.length < SERIES_SEARCH_QUERY_MIN_LENGTH) {
    return (
      <EmptyState
        icon={<Search className="size-8" />}
        title="Recherche trop courte"
        description={`Entre au moins ${SERIES_SEARCH_QUERY_MIN_LENGTH} caractères pour lancer la recherche.`}
      />
    );
  }

  if (query.length > SERIES_SEARCH_QUERY_MAX_LENGTH) {
    return (
      <EmptyState
        icon={<Search className="size-8" />}
        title="Recherche invalide"
        description={`La recherche ne peut pas dépasser ${SERIES_SEARCH_QUERY_MAX_LENGTH} caractères.`}
      />
    );
  }

  const queryResult = seriesSearchQuerySchema.safeParse(query);

  if (!queryResult.success) {
    return (
      <EmptyState
        icon={<Search className="size-8" />}
        title="Recherche invalide"
        description="Modifie ta recherche pour afficher des résultats."
      />
    );
  }

  return (
    <ValidSeriesSearchResults
      key={`${queryResult.data}:${pageResult.data}`}
      query={queryResult.data}
      page={pageResult.data}
    />
  );
}

type ValidSeriesSearchResultsProps = {
  query: string;
  page: number;
};

function ValidSeriesSearchResults({ query, page }: ValidSeriesSearchResultsProps) {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const importPendingRef = useRef(false);
  const selectedTmdbIdRef = useRef<number | null>(null);
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
