import { apiClient } from "@/api/client";
import type { SeriesSearchResponse } from "../types/series.types";
import { seriesSearchParamsSchema } from "../schemas/series.schemas";

export function seriesSearch(query: string, page: number): Promise<SeriesSearchResponse> {
  return apiClient<SeriesSearchResponse>("/metadata/series/search", {
    query: {
      query,
      page
    },
    querySchema: seriesSearchParamsSchema
  });
}
