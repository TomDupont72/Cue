import { tmdbGet } from "@/external/tmdb/tmdb.client.js";
import { TmdbTvDetailsResponse } from "@/external/tmdb/tmdb.types.js";
import { tmdbTvDetailsSchema } from "./tmdb.schemas.js";

export async function tvDetails(seriesId: number): Promise<TmdbTvDetailsResponse> {
  return await tmdbGet<TmdbTvDetailsResponse>(`/tv/${seriesId}`, tmdbTvDetailsSchema);
}
