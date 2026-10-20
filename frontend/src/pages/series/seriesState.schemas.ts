import { z } from "zod";

export const seriesStateSchema = z.object({
  id: z.coerce.number().int().min(1).optional(),
  tmdbId: z.number().int().min(1).optional()
});
