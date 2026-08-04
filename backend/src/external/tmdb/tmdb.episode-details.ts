import { tmdbGet } from "./tmdb.client.js";
import { tmdbEpisodeDetailsSchema } from "./tmdb.schemas.js";
import { TmdbEpisodeDetailsResponse } from "./tmdb.types.js";

export async function episodeDetails(
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number
): Promise<TmdbEpisodeDetailsResponse> {
  return tmdbGet(
    `/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`,
    tmdbEpisodeDetailsSchema
  );
}
