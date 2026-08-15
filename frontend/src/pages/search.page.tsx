import { Container } from "@/components/layout/container";
import { SeriesSearchForm } from "@/features/series/components/seriesSearchForm";
import { SeriesSearchResults } from "@/features/series/components/seriesSearchResults";
import { useTranslation } from "react-i18next";

export default function Search() {
  const { t } = useTranslation();

  return (
    <Container className="flex flex-1 flex-col py-8">
      <div className="flex flex-1 flex-col gap-8">
        <h1 className="text-3xl font-semibold">{t("series:search.title")}</h1>

        <SeriesSearchForm />

        <SeriesSearchResults />
      </div>
    </Container>
  );
}
