import { z } from "zod";

export const seriesRowSchema = z.object({
  id: z.number().int(),
  adult: z.boolean(),
  backdropPath: z.string().nullable(),
  firstAirDate: z.date().nullable(),
  tmdbId: z.number().int(),
  inProduction: z.boolean(),
  lastAirDate: z.date().nullable(),
  name: z.string(),
  numberOfEpisodes: z.number().int(),
  numberOfSeasons: z.number().int(),
  originalLanguage: z.string(),
  originalName: z.string(),
  overview: z.string().nullable(),
  popularity: z.number(),
  posterPath: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});
