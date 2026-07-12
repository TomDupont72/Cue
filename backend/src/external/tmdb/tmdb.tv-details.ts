import { tmdbGet } from "@/external/tmdb/tmdb.client.js";
import type { TmdbTvDetailsResponse } from "@/external/tmdb/tmdb.types.js";
import { tmdbTvDetailsSchema } from "./tmdb.schemas.js";

export async function tvDetails(seriesId: number): Promise<TmdbTvDetailsResponse> {
  return tmdbGet(`/tv/${seriesId}`, tmdbTvDetailsSchema);
}
