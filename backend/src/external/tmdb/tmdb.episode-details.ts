import { tmdbGet } from "@/external/tmdb/tmdb.client.js";
import { tmdbEpisodeDetailsSchema } from "@/external/tmdb/tmdb.schemas.js";
import { TmdbEpisodeDetailsResponse } from "@/external/tmdb/tmdb.types.js";

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
