import { tmdbGet } from "./tmdb.client.js";
import { tmdbSeasonDetailsSchema } from "./tmdb.schemas.js";
export async function seasonDetails(seriesId, seasonNumber) {
    return tmdbGet(`/tv/${seriesId}/season/${seasonNumber}`, tmdbSeasonDetailsSchema);
}
