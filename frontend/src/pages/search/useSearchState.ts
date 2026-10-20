import { useSearchParams } from "react-router-dom";

import { setUrlParams } from "@/lib/utils";
import { searchStateSchema } from "@/pages/search/searchState.schemas";

export function useSearchState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchState = searchStateSchema.safeParse({
    query: searchParams.get("query") ?? undefined,
    page: searchParams.get("page") ?? undefined
  });

  const setQuery = (query: string) => {
    setSearchParams((currentSearchParams) =>
      setUrlParams(currentSearchParams, [
        { name: "query", value: query, defaultValue: "" },
        { name: "page", value: 1, defaultValue: 1 }
      ])
    );
  };

  const setPage = (page: number) => {
    setSearchParams((currentSearchParams) =>
      setUrlParams(currentSearchParams, [{ name: "page", value: page, defaultValue: 1 }])
    );
  };

  return {
    ...searchState,
    setQuery,
    setPage
  };
}
