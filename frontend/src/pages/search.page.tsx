import { Container } from "@/components/layout/container";
import { SeriesSearchForm } from "@/features/series/components/seriesSearchForm";
import { SeriesSearchResults } from "@/features/series/components/seriesSearchResults";

export default function Search() {
  return (
    <Container className="flex flex-1 flex-col py-8">
      <div className="flex flex-1 flex-col gap-8">
        <h1 className="text-3xl font-semibold">Recherche</h1>

        <SeriesSearchForm />

        <SeriesSearchResults />
      </div>
    </Container>
  );
}
