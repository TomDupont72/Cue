import { tmdbGet } from "./client.tmdb.js";
import { TmdbTvSearchResponse } from "./types.tmdb.js";
import { tmdbTvSearchSchema } from "./modules.tmdb.js";

export async function tvSearch(query: string, page: number = 1): Promise<TmdbTvSearchResponse> {
  return await tmdbGet<TmdbTvSearchResponse>("/search/tv", tmdbTvSearchSchema, {
    query: query,
    page: page
  });
}
