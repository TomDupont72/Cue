import { tmdbGet } from "@/external/tmdb/tmdb.client.js";
import { tmdbSeasonDetailsSchema } from "@/external/tmdb/tmdb.schemas.js";
import { TmdbSeasonDetailsResponse } from "@/external/tmdb/tmdb.types.js";

export async function seasonDetails(
  seriesId: number,
  seasonNumber: number
): Promise<TmdbSeasonDetailsResponse> {
  return tmdbGet(`/tv/${seriesId}/season/${seasonNumber}`, tmdbSeasonDetailsSchema);
}
