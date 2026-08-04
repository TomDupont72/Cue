import { tmdbGet } from "@/external/tmdb/tmdb.client.js";
import { tmdbTvChangesSchema } from "@/external/tmdb/tmdb.schemas.js";

export async function tvChanges(startDate: string, endDate: string, page: number) {
  return tmdbGet(`/tv/changes`, tmdbTvChangesSchema, {
    start_date: startDate,
    end_date: endDate,
    page: page
  });
}
