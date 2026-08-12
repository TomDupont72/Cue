import { queryKeys } from "@/lib/queryKeys";
import { useMutation } from "@tanstack/react-query";
import { seriesImportPost } from "../api/series.api";
import { useNavigate } from "react-router-dom";


export function useSeriesImport() {
  const navigate = useNavigate()

  return useMutation({
    mutationKey: [...queryKeys.series.all, "import"],
    mutationFn: (tmdbId: number) => seriesImportPost(tmdbId),
    onSuccess: async (result) => {
      navigate(`/series?id=${result.series.id}`, {replace: true})
    }
  });
}