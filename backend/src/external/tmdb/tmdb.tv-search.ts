import { tmdbGet } from "@/external/tmdb/tmdb.client.js";
import { tmdbTvSearchSchema } from "@/external/tmdb/tmdb.schemas.js";
import { TmdbTvSearchResponse } from "@/external/tmdb/tmdb.types.js";

export async function tvSearch(query: string, page: number = 1): Promise<TmdbTvSearchResponse> {
  return tmdbGet("/search/tv", tmdbTvSearchSchema, {
    query: query,
    page: page
  });
}
