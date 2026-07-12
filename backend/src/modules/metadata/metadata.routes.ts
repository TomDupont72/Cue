import type { AppFastifyInstance } from "@/shared/types/fastify.js";
import { metadataSeriesSearchSchema } from "./metadata.schemas.js";
import { metadataSeriesSearchController } from "./metadata.controller.js";

export async function metadataRoutes(app: AppFastifyInstance) {
  app.get("/series/search", {
    preHandler: [app.requireAuth],
    schema: {
      querystring: metadataSeriesSearchSchema
    },
    handler: metadataSeriesSearchController.search
  });
}
