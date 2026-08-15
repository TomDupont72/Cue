import { Heading } from "@/components/layout/heading";
import { PageContainer } from "@/components/layout/pageContainer";
import { SeriesSearchForm } from "@/features/series/components/seriesSearchForm";
import { SeriesSearchResults } from "@/features/series/components/seriesSearchResults";
import { useTranslation } from "react-i18next";

export default function Search() {
  const { t } = useTranslation();

  return (
    <PageContainer className="gap-8">
      <Heading level={1} className="uppercase">
        {t("series:search.title")}
      </Heading>

      <SeriesSearchForm />

      <SeriesSearchResults />
    </PageContainer>
  );
}
