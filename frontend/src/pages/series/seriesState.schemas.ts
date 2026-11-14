import { z } from "zod";

export const seriesStateSchema = z.object({
  id: z.coerce.number().int().min(1).optional(),
  tmdbId: z.number().int().min(1).optional(),
  view: z
    .enum(["overview", "details"])
    .nullable()
    .transform((value) => value ?? "overview"),
  episodeNumber: z.coerce.number().int().min(1).nullable(),
  seasonNumber: z.coerce.number().int().min(0).nullable()
});
