import { z } from "zod";

const tmdbTvSearchResultsItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  original_name: z.string(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  first_air_date: z.string().optional().default(""),
  original_language: z.string(),
  vote_average: z.number(),
});

export const tmdbTvSearchResponseSchema = z.object({
  page: z.number(),
  results: z.array(tmdbTvSearchResultsItemSchema),
  total_pages: z.number(),
  total_results: z.number(),
});

const tmdbTvDetailsCreatedByItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    original_name: z.string(),
    gender: z.number(),
    profile_path: z.string().nullable(),
})

const tmdbTvDetailsGenresItemSchema = z.object({
    id: z.number(),
})

const tmdbTvDetailsNetworksItemSchema = z.object({
    id: z.number(),
})

export const tmdbTvDetailsSchema = z.object({
    adult: z.boolean(),
    backdrop_path: z.string().nullable(),
    created_by: z.array(tmdbTvDetailsCreatedByItemSchema),
    first_air_date: z.string().optional().default(""),
    genres: z.array(tmdbTvDetailsGenresItemSchema),
    id: z.number(),
    in_production: z.boolean(),
    name: z.string(),
    next_episode_to_air: z.string().nullable(),
    networks: z.array(tmdbTvDetailsNetworksItemSchema),
    number_of_episodes: z.number(),
    number_of_seasons: z.number(),
    original_language: z.string(),
    original_name: z.string(),
    overview: z.string().default(""),
    popularity: z.number(),
    poster_path: z.string().nullable(),
})