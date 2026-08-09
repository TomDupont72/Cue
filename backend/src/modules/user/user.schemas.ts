import z from "zod";
import { UserSeriesStatus } from "@/generated/prisma/enums.js";
import {
  seriesResponseSchema,
  userEpisodeResponseSchema,
  userSeriesResponseSchema
} from "@/modules/series/series.schemas.js";
import { userSeriesCursorTokenSchema } from "./user.pagination.js";

export const userSeriesStatuses = Object.values(UserSeriesStatus);

export const userSeriesStatusSchema = z.enum(UserSeriesStatus).meta({ id: "UserSeriesStatus" });

export const userSeriesPostBodySchema = z
  .object({
    status: userSeriesStatusSchema.optional(),
    isFavorite: z.boolean().optional()
  })
  .meta({ id: "UserSeriesPostBody" });

export const userSeriesPostParamsSchema = z.object({
  seriesId: z.coerce.number().int().min(1)
});

export type UserSeriesPostBody = z.infer<typeof userSeriesPostBodySchema>;
export type UserSeriesPostParams = z.infer<typeof userSeriesPostParamsSchema>;

export const userEpisodePostParamsSchema = z.object({
  seriesId: z.coerce.number().int().min(1),
  episodeId: z.coerce.number().int().min(1)
});

export const userSeriesGetParamsSchema = z.object({
  seriesId: z.coerce.number().int().min(1).optional(),
  status: userSeriesStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: userSeriesCursorTokenSchema.optional()
});

export const userSeasonPostParamsSchema = z.object({
  seriesId: z.coerce.number().int().min(1),
  seasonId: z.coerce.number().int().min(1)
});

export const userStatusRecalculateSchema = z.object({
  userId: z.string().min(1)
});

export const userEpisodeDeleteParamsSchema = userEpisodePostParamsSchema;

export const userSeasonDeleteParamsSchema = userSeasonPostParamsSchema;

const userSeriesGetItemResponseSchema = userSeriesResponseSchema
  .extend({
    seriesDetails: seriesResponseSchema
  })
  .meta({ id: "UserSeriesGetItem" });

export const userSeriesGetResponseSchema = z
  .object({
    items: z.array(userSeriesGetItemResponseSchema),
    hasNextPage: z.boolean(),
    nextCursor: z.string().nullable()
  })
  .meta({ id: "UserSeriesGetResponse" });

export const userSeriesPostResponseSchema = userSeriesResponseSchema;

export const userEpisodeFeedItemResponseSchema = z
  .object({
    userId: z.string(),
    seriesId: z.number().int(),
    status: userSeriesStatusSchema,
    lastWatchedAt: z.date().nullable(),
    seriesName: z.string(),
    seriesPosterPath: z.string().nullable(),
    seriesTmdbId: z.number().int(),
    id: z.number().int(),
    name: z.string(),
    seasonNumber: z.number().int(),
    episodeNumber: z.number().int(),
    airDate: z.date().nullable(),
    stillPath: z.string().nullable(),
    runtime: z.number().int(),
    overview: z.string().nullable(),
    remainingEpisodes: z.number().int().nonnegative()
  })
  .meta({ id: "UserEpisodeFeedItem" });

export const userEpisodeFeedGetResponseSchema = z
  .object({
    watching: z.array(userEpisodeFeedItemResponseSchema),
    paused: z.array(userEpisodeFeedItemResponseSchema),
    dropped: z.array(userEpisodeFeedItemResponseSchema)
  })
  .meta({ id: "UserEpisodeFeedResponse" });

export const userEpisodePostResponseSchema = userEpisodeResponseSchema
  .extend({
    seriesId: z.number().int(),
    nextEpisode: userEpisodeFeedItemResponseSchema.nullable()
  })
  .meta({ id: "UserEpisodePostResponse" });

export const userEpisodeDeleteResponseSchema = userEpisodeResponseSchema;

export const userSeasonPostResponseSchema = z
  .array(userEpisodeResponseSchema)
  .meta({ id: "UserSeasonResponse" });

export const userSeasonDeleteResponseSchema = userSeasonPostResponseSchema;

export const userDashboardSummaryGetResponseSchema = z
  .object({
    totalWatchedMinutes: z.number().int().nonnegative(),
    totalWatchedEpisodes: z.number().int().nonnegative(),
    totalWatchedSeries: z.number().int().nonnegative()
  })
  .meta({ id: "UserDashboardSummaryResponse" });

export const userStatusRecalculateResponseSchema = z
  .object({
    updatedCount: z.number().int().nonnegative()
  })
  .meta({ id: "UserStatusRecalculateResponse" });

export type UserEpisodePostParams = z.infer<typeof userEpisodePostParamsSchema>;

export type UserEpisodeDeleteParams = z.infer<typeof userEpisodeDeleteParamsSchema>;

export type UserSeriesGetParams = z.infer<typeof userSeriesGetParamsSchema>;

export type UserSeasonPostParams = z.infer<typeof userSeasonPostParamsSchema>;

export type UserSeasonDeleteParams = z.infer<typeof userSeasonDeleteParamsSchema>;

export type UserStatusRecalculate = z.infer<typeof userStatusRecalculateSchema>;

export type UserSeriesGetResponse = z.output<typeof userSeriesGetResponseSchema>;
export type UserSeriesPostResponse = z.output<typeof userSeriesPostResponseSchema>;
export type UserEpisodeFeedGetResponse = z.output<typeof userEpisodeFeedGetResponseSchema>;
export type UserEpisodePostResponse = z.output<typeof userEpisodePostResponseSchema>;
export type UserEpisodeDeleteResponse = z.output<typeof userEpisodeDeleteResponseSchema>;
export type UserSeasonPostResponse = z.output<typeof userSeasonPostResponseSchema>;
export type UserSeasonDeleteResponse = z.output<typeof userSeasonDeleteResponseSchema>;
export type UserDashboardSummaryGetResponse = z.output<
  typeof userDashboardSummaryGetResponseSchema
>;
export type UserStatusRecalculateResponse = z.output<typeof userStatusRecalculateResponseSchema>;
