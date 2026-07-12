import { tmdbGet } from "./tmdb.client.js";
import { tmdbTvSearchSchema } from "./tmdb.schemas.js";
export async function tvSearch(query, page = 1) {
    return tmdbGet("/search/tv", tmdbTvSearchSchema, {
        query: query,
        page: page
    });
}
