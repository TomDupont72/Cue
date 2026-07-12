import type { MetadataSeriesSearch } from "./metadata.schemas.js";
import { tvSearch } from "@/external/tmdb/tmdb.tv-search.js";

export const metadataService = {
  async metadataSearchSeries(input: MetadataSeriesSearch) {
    const results = await tvSearch(input.query, input.page);

    return results;
  }
};
