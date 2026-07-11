import { z } from "zod";
import { tmdbTvDetailsSchema, tmdbTvSearchResponseSchema } from "@/external/tmdb/modules.tmdb.js";

export type TmdbTvSearchResponse = z.infer<
  typeof tmdbTvSearchResponseSchema
>;

export type TmdbTvDetailsResponse = z.infer<
    typeof tmdbTvDetailsSchema
>;