import { tmdbGet } from "./client.tmdb.js";
import { TmdbTvSearchResponse } from "@/external/tmdb/types.tmdb.js";
import { tmdbTvSearchResponseSchema } from "./modules.tmdb.js";

export async function tvSearch(
  query: string,
  page: number = 1
): Promise<TmdbTvSearchResponse> {
  return await tmdbGet<TmdbTvSearchResponse>("/search/tv", tmdbTvSearchResponseSchema , {
    query: query,
    page: page,
  });
}
