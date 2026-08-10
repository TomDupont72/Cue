import type { AppFastifyInstance } from "@/shared/types/fastify.js";
import {
  metadataSeriesChangesResponseSchema,
  metadataSeriesChangesSchema,
  metadataSeriesSearchResponseSchema,
  metadataSeriesSearchSchema
} from "@/modules/metadata/metadata.schemas.js";
import {
  metadataSeriesChangesController,
  metadataSeriesSearchController
} from "@/modules/metadata/metadata.controller.js";

export async function metadataRoutes(app: AppFastifyInstance) {
  app.get("/series/search", {
    preHandler: [app.requireAuth],
    schema: {
      operationId: "searchMetadataSeries",
      security: [{ sessionCookie: [] }],
      tags: ["Metadata"],
      querystring: metadataSeriesSearchSchema,
      response: {
        200: metadataSeriesSearchResponseSchema
      }
    },
    handler: metadataSeriesSearchController.get
  });

  app.get("/series/changes", {
    preHandler: [app.requireWorker],
    schema: {
      operationId: "getMetadataSeriesChanges",
      security: [{ workerBearer: [] }],
      tags: ["Metadata"],
      querystring: metadataSeriesChangesSchema,
      response: {
        200: metadataSeriesChangesResponseSchema
      }
    },
    handler: metadataSeriesChangesController.get
  });
}
