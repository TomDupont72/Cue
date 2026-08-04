import type {
  MetadataSeriesChanges,
  MetadataSeriesSearch
} from "@/modules/metadata/metadata.schemas.js";
import { tvSearch } from "@/external/tmdb/tmdb.tv-search.js";
import { tvChanges } from "@/external/tmdb/tmdb.tv-changes.js";

export const metadataService = {
  async metadataSeriesSearch(input: MetadataSeriesSearch) {
    const results = await tvSearch(input.query, input.page);

    return results;
  },

  async metadataSeriesChanges(input: MetadataSeriesChanges) {
    const results = await tvChanges(input.startDate, input.endDate, input.page);

    return results;
  }
};
