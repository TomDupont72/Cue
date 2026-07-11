import { tmdbGet } from "./tmdb.client.js";
import { tmdbSeasonDetailsSchema } from "./tmdb.schemas.js";
import { TmdbSeasonDetailsResponse } from "./tmdb.types.js";

export async function seasonDetails(
  seriesId: number,
  seasonNumber: number
): Promise<TmdbSeasonDetailsResponse> {
  return await tmdbGet<TmdbSeasonDetailsResponse>(
    `/tv/${seriesId}/season/${seasonNumber}`,
    tmdbSeasonDetailsSchema
  );
}
