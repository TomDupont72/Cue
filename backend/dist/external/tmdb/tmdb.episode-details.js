import { tmdbGet } from "./tmdb.client.js";
import { tmdbEpisodeDetailsSchema } from "./tmdb.schemas.js";
export async function episodeDetails(seriesId, SeasonNumber, EpisodeNumber) {
    return tmdbGet(`/tv/${seriesId}/season/${SeasonNumber}/episode/${EpisodeNumber}`, tmdbEpisodeDetailsSchema);
}
