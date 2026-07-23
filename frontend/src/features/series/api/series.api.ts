import { apiClient } from "@/api/client";
import type {
  SeriesGetResponse,
  SeriesImportPostResponse,
  SeriesSearchGetResponse
} from "../types/series.types";
import type { SeriesImportPostBody } from "../schemas/series.schemas";
import {
  seriesGetParamsSchema,
  seriesImportPostBodySchema,
  seriesSearchGetParamsSchema
} from "../schemas/series.schemas";

export function seriesSearchGet(query: string, page: number): Promise<SeriesSearchGetResponse> {
  return apiClient<SeriesSearchGetResponse>("/metadata/series/search", {
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
