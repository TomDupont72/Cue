import { AppFastifyInstance } from "@/shared/types/fastify.js";
import { seriesImportSchema } from "./series.schemas.js";
import { seriesImportController } from "./series.controller.js";

export async function seriesRoutes(app: AppFastifyInstance) {
  app.post("/import", {
    preHandler: [app.requireAuth],
    schema: {
      body: seriesImportSchema
    },
    handler: seriesImportController.handle
  });
}
