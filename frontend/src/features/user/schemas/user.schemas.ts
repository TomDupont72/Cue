import { z } from "zod";
import { USER_SERIES_STATUS } from "@/features/user/constants/userSeriesStatus";

export const userSeriesGetQuerySchema = z.object({
  seriesId: z.number().int().min(1).optional(),
  status: z.enum(USER_SERIES_STATUS).optional(),
  limit: z.number().int().min(1).max(50),
  cursor: z.string().optional()
});

export const userEpisodePostParamsSchema = z.object({
  seriesId: z.number().int().min(1),
  episodeId: z.number().int().min(1)
});

export const userSeriesPostParamsSchema = z.object({
  seriesId: z.number().int().min(1)
});

export const userSeriesPostBodySchema = z.object({
  isFavorite: z.boolean().optional()
});

export const userSeasonPostParamsSchema = z.object({
  seriesId: z.number().int().min(1),
  seasonId: z.number().int().min(1)
});

export const userSeasonDeleteParamsSchema = userSeasonPostParamsSchema;

export const userEpisodeDeleteParamsSchema = userEpisodePostParamsSchema;

export type UserEpisodePostParams = z.infer<typeof userEpisodePostParamsSchema>;

export type UserEpisodeDeleteParams = z.infer<typeof userEpisodeDeleteParamsSchema>;

export type UserSeriesPostParams = z.infer<typeof userSeriesPostParamsSchema>;

export type UserSeriesPostBody = z.infer<typeof userSeriesPostBodySchema>;

export type UserSeasonPostParams = z.infer<typeof userSeasonPostParamsSchema>;

export type UserSeasonDeleteParams = z.infer<typeof userSeasonDeleteParamsSchema>;
