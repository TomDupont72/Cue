import { tmdbGet } from "./client.tmdb.js";

export async function searchSeries<TmdbSearchSeriesResponse>(
  query: string,
  page: number = 1
): Promise<TmdbSearchSeriesResponse> {
  return await tmdbGet<TmdbSearchSeriesResponse>("/search/tv", {
    query: query,
    page: page
  });
}
