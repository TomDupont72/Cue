import { AppFastifyInstance } from "@/shared/types/fastify.js";
import {
  userDashboardSummaryGetResponseSchema,
  userEpisodeDeleteParamsSchema,
  userEpisodeDeleteResponseSchema,
  userEpisodeFeedGetResponseSchema,
  userEpisodePostParamsSchema,
  userEpisodePostResponseSchema,
  userStatusRecalculateSchema,
  userStatusRecalculateResponseSchema,
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
  userSeasonController,
  userSeriesController,
  userStatusController
} from "@/modules/user/user.controller.js";

export async function userRoutes(app: AppFastifyInstance) {
  app.get("/series", {
    preHandler: [app.requireAuth],
    schema: {
      tags: ["User"],
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
      tags: ["User"],
      response: {
        200: userDashboardSummaryGetResponseSchema
      }
    },
    handler: userDashboardSummaryController.get
  });

  app.post("/series/:seriesId", {
    preHandler: [app.requireAuth],
    schema: {
      tags: ["User"],
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
      tags: ["User"],
      response: {
        200: userEpisodeFeedGetResponseSchema
      }
    },
    handler: userEpisodeController.getFeed
  });

  app.post("/series/:seriesId/episode/:episodeId", {
    preHandler: [app.requireAuth],
    schema: {
      tags: ["User"],
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
      tags: ["User"],
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
      tags: ["User"],
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
      tags: ["User"],
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
      tags: ["User"],
      params: userStatusRecalculateSchema,
      response: {
        200: userStatusRecalculateResponseSchema
      }
    },
    handler: userStatusController.post
  });
}
