import { AppFastifyInstance } from "@/shared/types/fastify.js";
import {
  userEpisodeDeleteParamsSchema,
  userEpisodePostParamsSchema,
  userSeriesGetParamsSchema,
  userSeriesPostBodySchema,
  userSeriesPostParamsSchema
} from "./user.schemas.js";
import {
  userDashboardSummaryController,
  userEpisodeController,
  userSeriesController
} from "./user.controller.js";

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
}
