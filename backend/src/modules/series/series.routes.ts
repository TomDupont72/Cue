import { AppFastifyInstance } from "@/shared/types/fastify.js";
import {
  seriesGetResponseSchema,
  seriesGetParamsSchema,
  seriesImportPostResponseSchema,
  seriesImportPostBodySchema
} from "@/modules/series/series.schemas.js";
import { seriesController, seriesImportController } from "@/modules/series/series.controller.js";
import { Tags } from "@/shared/enums/tags.js";

export async function seriesRoutes(app: AppFastifyInstance) {
  app.get("/:id", {
    preHandler: [app.requireAuth],
    schema: {
      tags: [Tags.SERIES],
      params: seriesGetParamsSchema,
      response: {
        200: seriesGetResponseSchema
      }
    },
    handler: seriesController.get
  });

  app.post("/import", {
    preHandler: app.auth([app.requireAuth, app.requireWorker], { relation: "or" }),
    schema: {
      tags: [Tags.SERIES],
      body: seriesImportPostBodySchema,
      response: {
        200: seriesImportPostResponseSchema
      }
    },
    handler: seriesImportController.post
  });
}
