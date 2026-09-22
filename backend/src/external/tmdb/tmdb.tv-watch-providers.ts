import { tmdbGet } from "@/external/tmdb/tmdb.client.js";
import { tmdbTvWatchProvidersSchema } from "@/external/tmdb/tmdb.schemas.js";
import { TmdbTvWatchProvidersResponse } from "@/external/tmdb/tmdb.types.js";

export async function tvWatchProviders(seriesId: number): Promise<TmdbTvWatchProvidersResponse> {
  return tmdbGet(`/tv/${seriesId}/watch/providers`, tmdbTvWatchProvidersSchema);
}
