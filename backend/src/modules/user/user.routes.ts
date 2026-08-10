import { AppFastifyInstance } from "@/shared/types/fastify.js";
import {
  userDashboardSummaryGetResponseSchema,
  userEpisodeDeleteParamsSchema,
  userEpisodeDeleteResponseSchema,
  userEpisodeFeedGetResponseSchema,
  userEpisodePostParamsSchema,
  userEpisodePostResponseSchema,
  userStatusPostParamsSchema,
  userStatusPostResponseSchema,
  userSeasonDeleteParamsSchema,
  userSeasonDeleteResponseSchema,
  userSeasonPostParamsSchema,
  userSeasonPostResponseSchema,
  userSeriesGetParamsSchema,
  userSeriesGetResponseSchema,
  userSeriesPostBodySchema,
  userSeriesPostParamsSchema,
  userSeriesPostResponseSchema
} from "@/modules/user/user.schemas.js";
import {
  userDashboardSummaryController,
  userEpisodeController,
  userEpisodeFeedController,
  userSeasonController,
  userSeriesController,
  userStatusController
} from "@/modules/user/user.controller.js";
import { Tags } from "@/shared/enums/tags.js";

export async function userRoutes(app: AppFastifyInstance) {
  app.get("/series", {
    preHandler: [app.requireAuth],
    schema: {
      tags: [Tags.USER],
      querystring: userSeriesGetParamsSchema,
      response: {
        200: userSeriesGetResponseSchema
      }
    },
    handler: userSeriesController.get
  });

  app.get("/dashboard/summary", {
    preHandler: [app.requireAuth],
    schema: {
      tags: [Tags.USER],
      response: {
        200: userDashboardSummaryGetResponseSchema
      }
    },
    handler: userDashboardSummaryController.get
  });

  app.post("/series/:seriesId", {
    preHandler: [app.requireAuth],
    schema: {
      tags: [Tags.USER],
      params: userSeriesPostParamsSchema,
      body: userSeriesPostBodySchema,
      response: {
        200: userSeriesPostResponseSchema
      }
    },
    handler: userSeriesController.post
  });

  app.get("/episodes/feed", {
    preHandler: [app.requireAuth],
    schema: {
      tags: [Tags.USER],
      response: {
        200: userEpisodeFeedGetResponseSchema
      }
    },
    handler: userEpisodeFeedController.get
  });

  app.post("/series/:seriesId/episode/:episodeId", {
    preHandler: [app.requireAuth],
    schema: {
      tags: [Tags.USER],
      params: userEpisodePostParamsSchema,
      response: {
        200: userEpisodePostResponseSchema
      }
    },
    handler: userEpisodeController.post
  });

  app.delete("/series/:seriesId/episode/:episodeId", {
    preHandler: [app.requireAuth],
    schema: {
      tags: [Tags.USER],
      params: userEpisodeDeleteParamsSchema,
      response: {
        200: userEpisodeDeleteResponseSchema
      }
    },
    handler: userEpisodeController.delete
  });

  app.post("/series/:seriesId/season/:seasonId", {
    preHandler: [app.requireAuth],
    schema: {
      tags: [Tags.USER],
      params: userSeasonPostParamsSchema,
      response: {
        200: userSeasonPostResponseSchema
      }
    },
    handler: userSeasonController.post
  });

  app.delete("/series/:seriesId/season/:seasonId", {
    preHandler: [app.requireAuth],
    schema: {
      tags: [Tags.USER],
      params: userSeasonDeleteParamsSchema,
      response: {
        200: userSeasonDeleteResponseSchema
      }
    },
    handler: userSeasonController.delete
  });

  app.post("/status/:userId/recalculate", {
    preHandler: [app.requireWorker],
    schema: {
      tags: [Tags.USER],
      params: userStatusPostParamsSchema,
      response: {
        200: userStatusPostResponseSchema
      }
    },
    handler: userStatusController.post
  });
}
