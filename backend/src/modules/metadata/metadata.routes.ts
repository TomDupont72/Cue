import type { AppFastifyInstance } from "@/shared/types/fastify.js";
import {
  metadataSeriesChangesGetResponseSchema,
  metadataSeriesChangesGetSchema,
  metadataSeriesSearchGetResponseSchema,
  metadataSeriesSearchGetSchema
} from "@/modules/metadata/metadata.schemas.js";
import {
  metadataSeriesChangesController,
  metadataSeriesSearchController
} from "@/modules/metadata/metadata.controller.js";

export async function metadataRoutes(app: AppFastifyInstance) {
  app.get("/series/search", {
    preHandler: [app.requireAuth],
    schema: {
      tags: ["Metadata"],
      querystring: metadataSeriesSearchGetSchema,
      response: {
        200: metadataSeriesSearchGetResponseSchema
      }
    },
    handler: metadataSeriesSearchController.get
  });

  app.get("/series/changes", {
    preHandler: [app.requireWorker],
    schema: {
      tags: ["Metadata"],
      querystring: metadataSeriesChangesGetSchema,
      response: {
        200: metadataSeriesChangesGetResponseSchema
      }
    },
    handler: metadataSeriesChangesController.get
  });
}
