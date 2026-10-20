import { useLocation, useSearchParams } from "react-router-dom";

import { setUrlParams } from "@/lib/utils";
import { seriesStateSchema } from "@/pages/series/seriesState.schemas";

export function useSeriesState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const seriesState = seriesStateSchema.safeParse({
    id: searchParams.get("id") ?? undefined,
    tmdbId: location.state?.tmdbId
  });

  const setId = (id: number) => {
    setSearchParams((currentSeriesParams) =>
      setUrlParams(currentSeriesParams, [{ name: "id", value: id }])
    );
  };

  return {
    ...seriesState,
    setId
  };
}
