import { UserSeriesStatus } from "@/generated/prisma/enums.js";
import { z } from "zod";

export const userEpisodeRowSchema = z.object({
  userId: z.string(),
  episodeId: z.number().int(),
  watchedAt: z.date()
});

export const userSeriesRowSchema = z.object({
  userId: z.string(),
  seriesId: z.number().int(),
  status: z.enum(UserSeriesStatus),
  isFavorite: z.boolean(),
  watchCount: z.number().int().nonnegative(),
  watchedEpisodeCount: z.number().int().nonnegative(),
  addedAt: z.date(),
  lastWatchedAt: z.date().nullable()
});
