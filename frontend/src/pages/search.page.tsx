import { Container } from "@/components/layout/container";
import { SeriesSearchForm } from "@/features/series/components/seriesSearchForm";
import { SeriesSearchResults } from "@/features/series/components/seriesSearchResults";
import { useSearchParams } from "react-router-dom";

export default function Search() {
  const [searchParams] = useSearchParams();
  // An import belongs to the search that started it. Remounting drops callbacks from a
  // previous search, so a late success cannot navigate away and a late error cannot leak.
  const resultsKey = searchParams.toString();

  return (
    <Container className="flex flex-1 flex-col py-8">
      <div className="flex flex-1 flex-col gap-8">
        <h1 className="text-3xl font-semibold">Recherche</h1>

        <SeriesSearchForm />

        <SeriesSearchResults key={resultsKey} />
      </div>
    </Container>
  );
}
