import { AppFastifyInstance } from "@/shared/types/fastify.js";
import {
  seriesGetResponseSchema,
  seriesGetSchema,
  seriesImportPostResponseSchema,
  seriesImportPostSchema
} from "@/modules/series/series.schemas.js";
import { seriesController, seriesImportController } from "@/modules/series/series.controller.js";

export async function seriesRoutes(app: AppFastifyInstance) {
  app.get("/:id", {
    preHandler: [app.requireAuth],
    schema: {
      operationId: "getSeries",
      security: [{ sessionCookie: [] }],
      tags: ["Series"],
      params: seriesGetSchema,
      response: {
        200: seriesGetResponseSchema
      }
    },
    handler: seriesController.get
  });

  app.post("/import", {
    preHandler: app.auth([app.requireAuth, app.requireWorker], { relation: "or" }),
    schema: {
      operationId: "importSeries",
      security: [{ sessionCookie: [] }, { workerBearer: [] }],
      tags: ["Series"],
      body: seriesImportPostSchema,
      response: {
        200: seriesImportPostResponseSchema
      }
    },
    handler: seriesImportController.post
  });
}
