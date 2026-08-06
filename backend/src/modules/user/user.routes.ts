import { AppFastifyInstance } from "@/shared/types/fastify.js";
import {
  userEpisodeDeleteParamsSchema,
  userEpisodePostParamsSchema,
  userStatusRecalculateSchema,
  userSeasonDeleteParamsSchema,
  userSeasonPostParamsSchema,
  userSeriesGetParamsSchema,
  userSeriesPostBodySchema,
  userSeriesPostParamsSchema
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
      querystring: userSeriesGetParamsSchema
    },
    handler: userSeriesController.get
  });

  app.get("/dashboard/summary", {
    preHandler: [app.requireAuth],
    schema: {
      tags: ["User"]
    },
    handler: userDashboardSummaryController.get
  });

  app.post("/series/:seriesId", {
    preHandler: [app.requireAuth],
    schema: {
      tags: ["User"],
      params: userSeriesPostParamsSchema,
      body: userSeriesPostBodySchema
    },
    handler: userSeriesController.post
  });

  app.get("/episodes/feed", {
    preHandler: [app.requireAuth],
    schema: {
      tags: ["User"]
    },
    handler: userEpisodeController.getFeed
  });

  app.post("/series/:seriesId/episode/:episodeId", {
    preHandler: [app.requireAuth],
    schema: {
      tags: ["User"],
      params: userEpisodePostParamsSchema
    },
    handler: userEpisodeController.post
  });

  app.delete("/series/:seriesId/episode/:episodeId", {
    preHandler: [app.requireAuth],
    schema: {
      tags: ["User"],
      params: userEpisodeDeleteParamsSchema
    },
    handler: userEpisodeController.delete
  });

  app.post("/series/:seriesId/season/:seasonId", {
    preHandler: [app.requireAuth],
    schema: {
      tags: ["User"],
      params: userSeasonPostParamsSchema
    },
    handler: userSeasonController.post
  });

  app.delete("/series/:seriesId/season/:seasonId", {
    preHandler: [app.requireAuth],
    schema: {
      tags: ["User"],
      params: userSeasonDeleteParamsSchema
    },
    handler: userSeasonController.delete
  });

  app.post("/status/:userId/recalculate", {
    preHandler: [app.requireWorker],
    schema: {
      tags: ["User"],
      params: userStatusRecalculateSchema
    },
    handler: userStatusController.post
  });
}
