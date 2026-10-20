import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@/components/feedback/emptyState";
import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import Paginator from "@/components/layout/paginator";
import { Text } from "@/components/layout/text";
import { MIN_QUERY_LENGTH } from "@/features/metadata/constants/query";
import SeriesDisplay from "@/features/series/components/seriesDisplay";
import { useSeriesSearch } from "@/features/series/hooks/useSeriesSearch";

type SeriesSearchResultsProps = {
  query: string;
  page: number;
  onPageChange: (page: number) => void;
};

export function SeriesSearchResults({ query, page, onPageChange }: SeriesSearchResultsProps) {
  const { t } = useTranslation();

  const seriesQuery = useSeriesSearch(query, page, query.length >= MIN_QUERY_LENGTH);

  if (!query) {
    return (
      <EmptyState
        icon={<Search className="size-8" />}
        title={t("series:search.emptyQueryTitle")}
        description={t("series:search.emptyQueryDescription")}
      />
    );
  }

  if (!seriesQuery.isEnabled) {
    return (
      <EmptyState
        icon={<Search className="size-8" />}
        title={t("series:search.queryTooShort")}
        description={t("series:search.minQueryLength", { count: MIN_QUERY_LENGTH })}
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
        description={t("series:search.emptyResultDescription", { query })}
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
        setCurrentPage={(nextPage: number) => {
          onPageChange(nextPage);

          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
