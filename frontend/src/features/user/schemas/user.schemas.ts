import { z } from "zod";
import { USER_SERIES_STATUS } from "@/features/user/constants/userSeriesStatus";

export const userSeriesGetQuerySchema = z.object({
  seriesId: z.number().int().min(1).optional(),
  status: z.enum(USER_SERIES_STATUS).optional(),
  limit: z.number().int().min(1).max(50),
  cursor: z.string().optional()
});

export type UserSeriesGetQuery = z.infer<typeof userSeriesGetQuerySchema>;

export const userEpisodePostParamsSchema = z.object({
  seriesId: z.number().int().min(1),
  episodeId: z.number().int().min(1)
});

export const userSeriesPostParamsSchema = z.object({
  seriesId: z.number().int().min(1)
});

export const userSeriesPostBodySchema = z.object({
  status: z.enum(USER_SERIES_STATUS).optional(),
  isFavorite: z.boolean().optional()
});

export const userSeasonPostParamsSchema = z.object({
  seriesId: z.number().int().min(1),
  seasonId: z.number().int().min(1)
});

export const userEpisodeDeleteParamsSchema = userEpisodePostParamsSchema;

export type UserEpisodePostParams = z.infer<typeof userEpisodePostParamsSchema>;

export type UserEpisodeDeleteParams = z.infer<typeof userEpisodeDeleteParamsSchema>;

export type UserSeriesPostParams = z.infer<typeof userSeriesPostParamsSchema>;

export type UserSeriesPostBody = z.infer<typeof userSeriesPostBodySchema>;
