import { z } from "zod";

export const genreRowSchema = z.object({
  id: z.number().int(),
  tmdbId: z.number().int(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});
