import { getSdkData, sdkRequestOptions, validateRequest } from "@/api/client";
import { getSeries, importSeries, searchMetadataSeries } from "@/api/generated/cue-api";
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
  const validatedQuery = validateRequest(seriesSearchGetParamsSchema, {
    query,
    page
  });

  return getSdkData(
    searchMetadataSeries({
      ...sdkRequestOptions,
      query: validatedQuery
    })
  );
}

export function seriesGet(id: number): Promise<SeriesGetResponse> {
  const path = validateRequest(seriesGetParamsSchema, {
    id
  });

  return getSdkData(
    getSeries({
      ...sdkRequestOptions,
      path
    })
  );
}

export function seriesImportPost(tmdbId: number): Promise<SeriesImportPostResponse> {
  const body = validateRequest<SeriesImportPostBody>(seriesImportPostBodySchema, {
    tmdbId
  });

  return getSdkData(
    importSeries({
      ...sdkRequestOptions,
      body
    })
  );
}
