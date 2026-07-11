import { tmdbGet } from "./client.tmdb.js";
import { tmdbSeasonDetailsSchema } from "./modules.tmdb.js";
import { TmdbSeasonDetailsResponse } from "./types.tmdb.js";

export async function seasonDetails(
  seriesId: number,
  seasonNumber: number
): Promise<TmdbSeasonDetailsResponse> {
  return await tmdbGet<TmdbSeasonDetailsResponse>(
    `/tv/${seriesId}/season/${seasonNumber}`,
    tmdbSeasonDetailsSchema
  );
}
