import { apiClient } from "@/api/client";
import type {
  SeriesGetResponse,
  SeriesImportPostResponse,
} from "@/features/series/types/series.types";
import type { SeriesImportPostBody } from "@/features/series/schemas/series.schemas";
import {
  seriesGetParamsSchema,
  seriesImportPostBodySchema,
  seriesSearchGetParamsSchema
} from "@/features/series/schemas/series.schemas";
import type { MetadataSeriesSearchGetResponse } from "@/features/metadata/types/metadata.types";

export function seriesSearchGet(query: string, page: number): Promise<MetadataSeriesSearchGetResponse> {
  return apiClient<MetadataSeriesSearchGetResponse>("/metadata/series/search", {
    query: {
      query,
      page
    },
    querySchema: seriesSearchGetParamsSchema
  });
}

export function seriesGet(id: number): Promise<SeriesGetResponse> {
  return apiClient<SeriesGetResponse>("/series/:id", {
    params: {
      id
    },
    paramsSchema: seriesGetParamsSchema
  });
}

export function seriesImportPost(tmdbId: number): Promise<SeriesImportPostResponse> {
  return apiClient<SeriesImportPostResponse, SeriesImportPostBody>("/series/import", {
    method: "POST",
    body: { tmdbId },
    bodySchema: seriesImportPostBodySchema
  });
}
