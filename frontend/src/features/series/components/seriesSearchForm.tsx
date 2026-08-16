import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useDebounce } from "@/hooks/useDebounce";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function SeriesSearchForm() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const query = searchParams.get("query") ?? "";
  const [value, setValue] = useState(query);
  
  const debouncedValue = useDebounce(value.trim(), 300);
  
  useEffect(() => {
    if (!debouncedValue) {
      setSearchParams({}, { replace: true });
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
          placeholder={t("series:search.placeholder")}
          value={value}
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
