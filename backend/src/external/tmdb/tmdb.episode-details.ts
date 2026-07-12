import { tmdbGet } from "./tmdb.client.js";
import { tmdbEpisodeDetailsSchema } from "./tmdb.schemas.js";
import { TmdbEpisodeDetailsResponse } from "./tmdb.types.js";

export async function episodeDetails(
  seriesId: number,
  SeasonNumber: number,
  EpisodeNumber: number
): Promise<TmdbEpisodeDetailsResponse> {
  return tmdbGet(
    `/tv/${seriesId}/season/${SeasonNumber}/episode/${EpisodeNumber}`,
    tmdbEpisodeDetailsSchema
  );
}
