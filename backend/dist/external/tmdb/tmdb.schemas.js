import { camelCaseKeys, excludeMissingFields } from "@/shared/utils/object/object.js";
import { z } from "zod";
const nullableDateSchema = z
    .string()
    .nullable()
    .transform((value) => (value ? new Date(value) : null));
const tmdbTvSearchResultsItemSchema = z
    .object({
    id: z.number(),
    name: z.string(),
    original_name: z.string(),
    overview: z.string(),
    poster_path: z.string().nullable(),
    backdrop_path: z.string().nullable(),
    first_air_date: z.string().nullable(),
    original_language: z.string(),
    vote_average: z.number()
})
    .transform((series) => camelCaseKeys(series, {
    id: "tmdbId"
}));
export const tmdbTvSearchSchema = z.object({
    page: z.number(),
    results: z.array(tmdbTvSearchResultsItemSchema),
    total_pages: z.number(),
    total_results: z.number()
});
const tmdbPeopleItemSchema = z
    .object({
    adult: z.boolean().nullish(),
    gender: z.number(),
    id: z.number(),
    known_for_department: z.string().nullish(),
    name: z.string(),
    popularity: z.number().nullish(),
    profile_path: z.string().nullable()
})
    .transform((people) => camelCaseKeys(people, { id: "tmdbId" }));
const tmdbTvDetailsGenresItemSchema = z
    .object({
    id: z.number(),
    name: z.string()
})
    .transform((genre) => camelCaseKeys(genre, { id: "tmdbId" }));
const tmdbTvDetailsNetworksItemSchema = z
    .object({
    id: z.number(),
    logo_path: z.string().nullable(),
    name: z.string()
})
    .transform((network) => camelCaseKeys(network, {
    id: "tmdbId"
}));
const tmdbTvDetailsSeasonsItemSchema = z
    .object({
    id: z.number(),
    season_number: z.number()
})
    .transform((season) => camelCaseKeys(season, { id: "tmdbId" }));
export const tmdbTvDetailsSchema = z
    .object({
    adult: z.boolean(),
    backdrop_path: z.string().nullable(),
    created_by: z.array(tmdbPeopleItemSchema),
    first_air_date: nullableDateSchema,
    genres: z.array(tmdbTvDetailsGenresItemSchema),
    id: z.number(),
    in_production: z.boolean(),
    last_air_date: nullableDateSchema,
    name: z.string(),
    seasons: z.array(tmdbTvDetailsSeasonsItemSchema),
    networks: z.array(tmdbTvDetailsNetworksItemSchema),
    number_of_episodes: z.number(),
    number_of_seasons: z.number(),
    original_language: z.string(),
    original_name: z.string(),
    overview: z.string().default(""),
    popularity: z.number(),
    poster_path: z.string().nullable()
})
    .transform((series) => camelCaseKeys(series, { id: "tmdbId" }));
export const tmdbEpisodeDetailsGuestStarSchema = z
    .object({
    adult: z.boolean(),
    character: z.string(),
    gender: z.number(),
    id: z.number(),
    known_for_department: z.string(),
    name: z.string(),
    popularity: z.number(),
    profile_path: z.string().nullable()
})
    .transform((people) => camelCaseKeys(people, { id: "tmdbId" }));
export const tmdbEpisodeDetailsSchema = z
    .object({
    air_date: nullableDateSchema,
    crew: excludeMissingFields(tmdbPeopleItemSchema, ["id"]),
    episode_number: z.number(),
    guest_stars: excludeMissingFields(tmdbEpisodeDetailsGuestStarSchema, ["id"]),
    name: z.string(),
    overview: z.string().default(""),
    id: z.number(),
    still_path: z.string().nullable(),
    runtime: z
        .number()
        .nullable()
        .transform((value) => value ?? 0),
    season_number: z.number(),
    vote_average: z.number()
})
    .transform((episode) => camelCaseKeys(episode, { id: "tmdbId" }));
export const tmdbSeasonDetailsSchema = z
    .object({
    air_date: nullableDateSchema,
    episodes: z.array(tmdbEpisodeDetailsSchema),
    name: z.string(),
    overview: z.string().default(""),
    id: z.number(),
    poster_path: z.string().nullable(),
    season_number: z.number(),
    vote_average: z.number()
})
    .transform((season) => camelCaseKeys(season, { id: "tmdbId" }));
