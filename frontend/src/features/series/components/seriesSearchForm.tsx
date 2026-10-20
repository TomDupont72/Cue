import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { useDebounce } from "@/hooks/useDebounce";

type SeriesSearchFormProps = {
  query: string | undefined;
  onQueryChange: (query: string) => void;
};

export function SeriesSearchForm({ query, onQueryChange }: SeriesSearchFormProps) {
  const { t } = useTranslation();

  const [queryDebounced, setQueryDebounced] = useState(query);
  const debouncedValue = useDebounce(queryDebounced, 300);

  useEffect(() => {
    if (debouncedValue !== query) {
      onQueryChange(debouncedValue);
    }
  }, [debouncedValue, query, onQueryChange]);

  return (
    <div className="relative w-full max-w-2xl">
      <InputGroup>
        <InputGroupInput
          placeholder={t("series:search.placeholder")}
          value={queryDebounced}
          onChange={(event) => setQueryDebounced(event.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      {queryDebounced && (
        <Button
          variant="simple"
          onClick={() => setQueryDebounced("")}
          className="absolute right-0 top-0"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
