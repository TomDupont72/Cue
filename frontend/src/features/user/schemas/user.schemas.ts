import { z } from "zod";

export const userEpisodePostParamsSchema = z.object({
  seriesId: z.number().int().min(1),
  episodeId: z.number().int().min(1)
});

export type UserEpisodePostParams = z.infer<typeof userEpisodePostParamsSchema>;
