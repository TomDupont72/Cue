import { z } from "zod";
import {
  tmdbSeasonDetailsSchema,
  tmdbTvDetailsSchema,
  tmdbTvSearchSchema
} from "./modules.tmdb.js";

export type TmdbTvSearchResponse = z.infer<typeof tmdbTvSearchSchema>;

export type TmdbTvDetailsResponse = z.infer<typeof tmdbTvDetailsSchema>;

export type TmdbSeasonDetailsResponse = z.infer<typeof tmdbSeasonDetailsSchema>;
