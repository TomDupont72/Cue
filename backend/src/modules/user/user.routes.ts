import { AppFastifyInstance } from "@/shared/types/fastify.js";
import {
  userDashboardSummaryGetResponseSchema,
  userEpisodeDeleteParamsSchema,
  userEpisodeDeleteResponseSchema,
  userEpisodeFeedGetResponseSchema,
  userEpisodePostParamsSchema,
  userEpisodePostResponseSchema,
  userSeriesReconcilePostParamsSchema,
  userSeriesReconcilePostResponseSchema,
  userSeasonDeleteParamsSchema,
  userSeasonDeleteResponseSchema,
  userSeasonPostParamsSchema,
  userSeasonPostResponseSchema,
  userSeriesGetSchema,
  userSeriesGetResponseSchema,
  userSeriesPostBodySchema,
  userSeriesPostParamsSchema,
  userSeriesPostResponseSchema,
  userEpisodeUpcomingGetResponseSchema
} from "@/modules/user/user.schemas.js";
import {
  userDashboardSummaryController,
  userEpisodeController,
  userEpisodeFeedController,
  userEpisodeUpcomingController,
  userSeasonController,
  userSeriesController,
  userSeriesReconcileController
} from "@/modules/user/user.controller.js";
import { Tags } from "@/shared/enums/tags.js";

export async function userRoutes(app: AppFastifyInstance) {
  app.get("/series", {
    preHandler: [app.requireAuth],
    schema: {
      tags: [Tags.USER],
      querystring: userSeriesGetSchema,
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

  app.get("/episodes/upcoming", {
    preHandler: [app.requireAuth],
    schema: {
      tags: [Tags.USER],
      response: {
        200: userEpisodeUpcomingGetResponseSchema
      }
    },
    handler: userEpisodeUpcomingController.get
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

  app.post("/:userId/series/reconcile", {
    preHandler: [app.requireWorker],
    schema: {
      tags: [Tags.USER],
      params: userSeriesReconcilePostParamsSchema,
      response: {
        200: userSeriesReconcilePostResponseSchema
      }
    },
    handler: userSeriesReconcileController.post
  });
}
