import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useDebounce } from "@/hooks/useDebounce";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import {
  SERIES_SEARCH_QUERY_MAX_LENGTH,
  SERIES_SEARCH_QUERY_MIN_LENGTH
} from "@/features/series/schemas/series.schemas";

export function SeriesSearchForm() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("query") ?? "";
  const [value, setValue] = useState(query);

  const debouncedValue = useDebounce(value.trim(), 300);

  useEffect(() => {
    if (debouncedValue.length < SERIES_SEARCH_QUERY_MIN_LENGTH) {
      if (query) {
        setSearchParams({}, { replace: true });
      }

      return;
    }

    if (debouncedValue.length > SERIES_SEARCH_QUERY_MAX_LENGTH) {
      return;
    }

    if (debouncedValue === query) {
      return;
    }

    setSearchParams({ query: debouncedValue, page: "1" }, { replace: true });
  }, [debouncedValue, query, setSearchParams]);

  function handleClear() {
    setValue("");
  }

  return (
    <div className="relative w-full max-w-2xl">
      <InputGroup>
        <InputGroupInput
          placeholder="Rechercher une serie..."
          value={value}
          maxLength={SERIES_SEARCH_QUERY_MAX_LENGTH}
          onChange={(event) => setValue(event.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      {value && (
        <Button variant="simple" onClick={handleClear} className="absolute right-0 top-0">
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
