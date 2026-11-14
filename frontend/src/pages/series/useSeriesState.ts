import { useLocation, useSearchParams } from "react-router-dom";

import { setUrlParams } from "@/lib/utils";
import { seriesStateSchema } from "@/pages/series/seriesState.schemas";

export function useSeriesState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const seriesState = seriesStateSchema.safeParse({
    id: searchParams.get("id") ?? undefined,
    tmdbId: location.state?.tmdbId,
    view: searchParams.get("view"),
    episodeNumber: searchParams.get("episodeNumber"),
    seasonNumber: searchParams.get("seasonNumber")
  });

  const setId = (id: number) => {
    setSearchParams((currentSeriesParams) =>
      setUrlParams(currentSeriesParams, [{ name: "id", value: id }])
    );
  };

  const setView = (view: string) => {
    setSearchParams((currentViewParams) =>
      setUrlParams(currentViewParams, [{ name: "view", value: view, defaultValue: "overview" }])
    );
  };

  return {
    ...seriesState,
    setId,
    setView
  };
}
