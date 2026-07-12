import { env } from "@/shared/config/env.js";
import pLimit from "p-limit";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const limit = pLimit(3);
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function rawTmdbGet(path, params, schema) {
    const url = new URL(`${TMDB_BASE_URL}${path}`);
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value));
        }
    }
    url.searchParams.set("language", "fr-FR");
    for (let attempt = 1; attempt <= 3; attempt++) {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${env.TMDB_API_TOKEN}`,
                Accept: "application/json"
            }
        });
        if (response.ok) {
            const data = await response.json();
            return schema.parse(data);
        }
        if (response.status === 429 || response.status >= 500) {
            const retryAfter = response.headers.get("retry-after");
            const waitMs = retryAfter ? Number(retryAfter) * 1000 : attempt * 1000;
            await sleep(waitMs);
            continue;
        }
        throw new Error(`TMDB request failed: ${response.status}`);
    }
    throw new Error("TMDB request failed after retries");
}
export function tmdbGet(path, schema, params = {}) {
    return limit(() => rawTmdbGet(path, params, schema));
}
