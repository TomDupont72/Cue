import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/feedback/emptyState";
import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { useSeriesSearch } from "../hooks/useSeriesSearch";
import { SeriesCard } from "./seriesCard";
import Paginator from "@/components/layout/paginator";

export function SeriesSearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("query")?.trim() ?? "";
  const page = Number(searchParams.get("page")?.trim() ?? 1);

  const seriesQuery = useSeriesSearch(query, page);

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

      <div
        className="
          grid grid-cols-2 gap-4
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
        "
      >
        {seriesQuery.data.results.map((series) => (
          <SeriesCard key={series.tmdbId} series={series} />
        ))}
      </div>

      <Paginator
        currentPage={page}
        pageNumber={seriesQuery.data.totalPages}
        setCurrentPage={handlePageChange}
      />
    </div>
  );
}
