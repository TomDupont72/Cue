import { tmdbGet } from "@/external/tmdb/tmdb.client.js";
import { tmdbTvDetailsSchema } from "./tmdb.schemas.js";
export async function tvDetails(seriesId) {
    return tmdbGet(`/tv/${seriesId}`, tmdbTvDetailsSchema);
}
