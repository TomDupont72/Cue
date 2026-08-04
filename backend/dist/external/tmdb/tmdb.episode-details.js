import { tmdbGet } from "./tmdb.client.js";
import { tmdbEpisodeDetailsSchema } from "./tmdb.schemas.js";
export async function episodeDetails(seriesId, seasonNumber, episodeNumber) {
    return tmdbGet(`/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`, tmdbEpisodeDetailsSchema);
}
