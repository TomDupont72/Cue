import { useTranslation } from "react-i18next";

import { ErrorState } from "@/components/feedback/errorState";
import { Heading } from "@/components/layout/heading";
import { PageContainer } from "@/components/layout/pageContainer";
import { SeriesSearchForm } from "@/features/series/components/seriesSearchForm";
import { SeriesSearchResults } from "@/features/series/components/seriesSearchResults";
import { useSearchState } from "@/pages/search/useSearchState";

export default function SearchContent() {
  const { t } = useTranslation();

  const searchState = useSearchState();

  if (!searchState.success) {
    return <ErrorState error={t("errors:invalidRequest")} />;
  }

  return (
    <PageContainer className="gap-8">
      <Heading level={1} className="uppercase">
        {t("series:search.title")}
      </Heading>

      <SeriesSearchForm query={searchState.data.query} onQueryChange={searchState.setQuery} />

      <SeriesSearchResults
        query={searchState.data.query}
        page={searchState.data.page}
        onPageChange={searchState.setPage}
      />
    </PageContainer>
  );
}
