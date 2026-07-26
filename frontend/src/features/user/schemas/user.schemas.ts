import { z } from "zod";
import { USER_SERIES_STATUS } from "../constants/userSeriesStatus";

export const userSeriesGetQuerySchema = z.object({
  status: z.enum(USER_SERIES_STATUS),
  limit: z.number().int().min(1).max(50),
  cursor: z.string().optional()
});

export type UserSeriesGetQuery = z.infer<typeof userSeriesGetQuerySchema>;

export const userEpisodePostParamsSchema = z.object({
  seriesId: z.number().int().min(1),
  episodeId: z.number().int().min(1)
});

export const userEpisodeDeleteParamsSchema = userEpisodePostParamsSchema;

export type UserEpisodePostParams = z.infer<typeof userEpisodePostParamsSchema>;

export type UserEpisodeDeleteParams = z.infer<typeof userEpisodeDeleteParamsSchema>;
