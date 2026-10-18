import type { MetadataSeriesSearchGetResponse } from "@/features/metadata/types/metadata.types";
import type { SeriesImportPostBody } from "@/features/series/schemas/series.schemas";
import type {
  SeriesGetResponse,
  SeriesImportPostResponse
} from "@/features/series/types/series.types";

import { ApiClient } from "@/api/client";
import {
  seriesGetParamsSchema,
  seriesImportPostBodySchema,
  seriesSearchGetParamsSchema
} from "@/features/series/schemas/series.schemas";

export function seriesSearchGet(
  query: string,
  page: number
): Promise<MetadataSeriesSearchGetResponse> {
  return ApiClient<MetadataSeriesSearchGetResponse>("/metadata/series/search", {
    query: {
      query,
      page
    },
    querySchema: seriesSearchGetParamsSchema
  });
}

export function seriesGet(id: number): Promise<SeriesGetResponse> {
  return ApiClient<SeriesGetResponse>("/series/:id", {
    params: {
      id
    },
    paramsSchema: seriesGetParamsSchema
  });
}

export function seriesImportPost(tmdbId: number): Promise<SeriesImportPostResponse> {
  return ApiClient<SeriesImportPostResponse, SeriesImportPostBody>("/series/import", {
    method: "POST",
    body: { tmdbId },
    bodySchema: seriesImportPostBodySchema
  });
}
