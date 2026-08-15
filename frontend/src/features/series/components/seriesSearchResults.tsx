import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/feedback/emptyState";
import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { useSeriesSearch } from "@/features/series/hooks/useSeriesSearch";
import Paginator from "@/components/layout/paginator";
import SeriesDisplay from "@/features/series/components/seriesDisplay";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/layout/text";

export function SeriesSearchResults() {
  const { t } = useTranslation();

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
        title={t("series:search.emptyQueryTitle")}
        description={t("series:search.emptyQueryDescription")}
      />
    );
  }

  if (seriesQuery.isPending) {
    return <LoadingState />;
  }

  if (seriesQuery.isError) {
    return <ErrorState error={seriesQuery.error} onRetry={seriesQuery.refetch} />;
  }

  if (seriesQuery.data.results.length === 0) {
    return (
      <EmptyState
        icon={<Search className="size-8" />}
        title={t("series:search.emptyResultTitle")}
        description={t("series:search.emptyResultDescription", { query: query })}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Text variant="muted">
        {t("series:search.result", { count: seriesQuery.data.totalResults })}
      </Text>

      <SeriesDisplay series={seriesQuery.data.results} />

      <Paginator
        currentPage={page}
        pageNumber={seriesQuery.data.totalPages}
        setCurrentPage={handlePageChange}
      />
    </div>
  );
}
