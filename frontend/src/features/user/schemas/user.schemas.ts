import { z } from "zod";
import { USER_SERIES_STATUS } from "@/features/user/constants/userSeriesStatus";
import type {
  GetUserSeriesData,
  MarkUserEpisodeWatchedData,
  MarkUserSeasonWatchedData,
  UnmarkUserEpisodeWatchedData,
  UnmarkUserSeasonWatchedData,
  UpsertUserSeriesData
} from "@/api/generated/cue-api";

export const userSeriesGetQuerySchema = z.object({
  seriesId: z.number().int().min(1).optional(),
  status: z.enum(USER_SERIES_STATUS).optional(),
  limit: z.number().int().min(1).max(50),
  cursor: z.string().optional()
}) satisfies z.ZodType<NonNullable<GetUserSeriesData["query"]>>;

export type UserSeriesGetQuery = NonNullable<GetUserSeriesData["query"]>;

export const userEpisodePostParamsSchema = z.object({
  seriesId: z.number().int().min(1),
  episodeId: z.number().int().min(1)
}) satisfies z.ZodType<MarkUserEpisodeWatchedData["path"]>;

export const userSeriesPostParamsSchema = z.object({
  seriesId: z.number().int().min(1)
}) satisfies z.ZodType<UpsertUserSeriesData["path"]>;

export const userSeriesPostBodySchema = z.object({
  status: z.enum(USER_SERIES_STATUS).optional(),
  isFavorite: z.boolean().optional()
}) satisfies z.ZodType<UpsertUserSeriesData["body"]>;

export const userSeasonPostParamsSchema = z.object({
  seriesId: z.number().int().min(1),
  seasonId: z.number().int().min(1)
}) satisfies z.ZodType<MarkUserSeasonWatchedData["path"]>;

export const userSeasonDeleteParamsSchema = userSeasonPostParamsSchema satisfies z.ZodType<
  UnmarkUserSeasonWatchedData["path"]
>;

export const userEpisodeDeleteParamsSchema = userEpisodePostParamsSchema satisfies z.ZodType<
  UnmarkUserEpisodeWatchedData["path"]
>;

export type UserEpisodePostParams = MarkUserEpisodeWatchedData["path"];

export type UserEpisodeDeleteParams = UnmarkUserEpisodeWatchedData["path"];

export type UserSeriesPostParams = UpsertUserSeriesData["path"];

export type UserSeriesPostBody = UpsertUserSeriesData["body"];

export type UserSeasonPostParams = MarkUserSeasonWatchedData["path"];

export type UserSeasonDeleteParams = UnmarkUserSeasonWatchedData["path"];
