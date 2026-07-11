import { tmdbGet } from "./tmdb.client.js";
import { TmdbTvSearchResponse } from "./tmdb.types.js";
import { tmdbTvSearchSchema } from "./tmdb.schemas.js";

export async function tvSearch(query: string, page: number = 1): Promise<TmdbTvSearchResponse> {
  return await tmdbGet<TmdbTvSearchResponse>("/search/tv", tmdbTvSearchSchema, {
    query: query,
    page: page
  });
}
