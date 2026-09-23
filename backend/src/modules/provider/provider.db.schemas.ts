import { z } from "zod";

export const providerRowSchema = z.object({
  id: z.number().int(),
  tmdbId: z.number().int(),
  name: z.string(),
  logoPath: z.string().nullable(),
  displayPriority: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date()
});
