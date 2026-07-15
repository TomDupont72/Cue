import { AppFastifyInstance } from "@/shared/types/fastify.js";
import { seriesGetSchema, seriesImportPostSchema } from "./series.schemas.js";
import { seriesController, seriesImportController } from "./series.controller.js";

export async function seriesRoutes(app: AppFastifyInstance) {
  app.get("/:id", {
    preHandler: [app.requireAuth],
    schema: {
      params: seriesGetSchema
    },
    handler: seriesController.get
  });

  app.post("/import", {
    preHandler: [app.requireAuth],
    schema: {
      body: seriesImportPostSchema
    },
    handler: seriesImportController.post
  });
}
