import { z } from "zod";
import {
  tmdbEpisodeDetailsGuestStarSchema,
  tmdbEpisodeDetailsSchema,
  tmdbSeasonDetailsSchema,
  tmdbTvDetailsSchema,
  tmdbTvSearchSchema
} from "./tmdb.schemas.js";

export type TmdbTvSearchResponse = z.infer<typeof tmdbTvSearchSchema>;

export type TmdbTvDetailsResponse = z.infer<typeof tmdbTvDetailsSchema>;

export type TmdbSeasonDetailsResponse = z.infer<typeof tmdbSeasonDetailsSchema>;

export type TmdbEpisodeDetailsResponse = z.infer<typeof tmdbEpisodeDetailsSchema>;

export type TmdbEpisodeDetailsGuestStar = z.infer<typeof tmdbEpisodeDetailsGuestStarSchema>;
