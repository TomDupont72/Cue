import type { AppFastifyInstance } from "@/shared/types/fastify.js";
import { seriesSearchSchema } from "./metadata.schemas.js";
import { seriesSearchController } from "./metadata.controller.js";

export async function metadataRoutes(app: AppFastifyInstance) {
  app.get("/series/search", {
    preHandler: [app.requireAuth],
    schema: {
      querystring: seriesSearchSchema,
    },
    handler: seriesSearchController.search,
  });
}