import { tmdbGet } from "@/external/tmdb/client.tmdb.js";
import { TmdbTvDetailsResponse } from "@/external/tmdb/types.tmdb.js";
import { tmdbTvDetailsSchema } from "./modules.tmdb.js";

export async function tvDetails(seriesId: number): Promise<TmdbTvDetailsResponse> {
  return await tmdbGet<TmdbTvDetailsResponse>(`/tv/${seriesId}`, tmdbTvDetailsSchema);
}
