import { z } from "zod";

export const episodeRowSchema = z.object({
  id: z.number().int(),
  seriesId: z.number().int(),
  seasonId: z.number().int(),
  airDate: z.date().nullable(),
  episodeNumber: z.number().int(),
  name: z.string(),
  overview: z.string().nullable(),
  tmdbId: z.number().int(),
  stillPath: z.string().nullable(),
  runtime: z.number().int(),
  seasonNumber: z.number().int(),
  voteAverage: z.number(),
  createdAt: z.date(),
  updatedAt: z.date()
});
