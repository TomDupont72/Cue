import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { seriesImportPost } from "@/features/series/api/series.api";
import { queryKeys } from "@/lib/queryKeys";

export function useSeriesImportMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: [...queryKeys.series.all, "import"],
    mutationFn: (tmdbId: number) => seriesImportPost(tmdbId),
    onSuccess: async (result) => {
      navigate(`/series?id=${result.series.id}`, { replace: true });
    }
  });
}
