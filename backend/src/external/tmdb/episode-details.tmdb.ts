import { tmdbGet } from "./client.tmdb.js";
import { tmdbEpisodeDetailsSchema } from "./modules.tmdb.js";
import { TmdbEpisodeDetailsResponse } from "./types.tmdb.js";

export async function episodeDetails(
  seriesId: number,
  SeasonNumber: number,
  EpisodeNumber: number
): Promise<TmdbEpisodeDetailsResponse> {
  return await tmdbGet<TmdbEpisodeDetailsResponse>(
    `/tv/${seriesId}/season/${SeasonNumber}/episode/${EpisodeNumber}`,
    tmdbEpisodeDetailsSchema
  );
}
