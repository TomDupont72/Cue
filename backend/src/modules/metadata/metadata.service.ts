import type { SeriesSearch } from "./metadata.schemas.js";
import { tvSearch } from "@/external/tmdb/tmdb.tv-search.js";

export const metadataService = {
  async searchSeries(input: SeriesSearch) {
    const results = await tvSearch(
      input.query,
      input.page,
    );

    return results
  },
};