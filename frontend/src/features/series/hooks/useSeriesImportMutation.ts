import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { seriesImportPost } from "../api/series.api";
import type { SeriesImportPostResponse } from "../types/series.types";

const pendingImports = new Map<number, Promise<SeriesImportPostResponse>>();

function importSeriesOnce(tmdbId: number): Promise<SeriesImportPostResponse> {
  const pendingImport = pendingImports.get(tmdbId);

  if (pendingImport) {
    return pendingImport;
  }

  const importRequest = seriesImportPost(tmdbId).finally(() => {
    if (pendingImports.get(tmdbId) === importRequest) {
      pendingImports.delete(tmdbId);
    }
  });

  pendingImports.set(tmdbId, importRequest);

  return importRequest;
}

export function useSeriesImportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...queryKeys.series.all, "import"],
    mutationFn: importSeriesOnce,
    retry: false,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.series.detail(result.series.id),
        exact: true
      });
    }
  });
}
