import { z } from "zod";

export const seasonRowSchema = z.object({
  id: z.number().int(),
  seriesId: z.number().int(),
  airDate: z.date().nullable(),
  name: z.string(),
  overview: z.string().nullable(),
  tmdbId: z.number().int(),
  posterPath: z.string().nullable(),
  seasonNumber: z.number().int(),
  voteAverage: z.number(),
  createdAt: z.date(),
  updatedAt: z.date()
});
