import { metadataSeriesChangesSchema, metadataSeriesSearchSchema } from "../../modules/metadata/metadata.schemas.js";
import { metadataSeriesChangesController, metadataSeriesSearchController } from "../../modules/metadata/metadata.controller.js";
import { isWorkerRequest } from "../../shared/middlewares/verify-worker-request.js";
export async function metadataRoutes(app) {
    app.get("/series/search", {
        preHandler: [app.requireAuth],
        schema: {
            tags: ["Metadata"],
            querystring: metadataSeriesSearchSchema
        },
        handler: metadataSeriesSearchController.get
    });
    app.get("/series/changes", {
        preHandler: [
            async (request, reply) => {
                if (!isWorkerRequest(request)) {
                    await app.requireAuth(request, reply);
                }
            }
        ],
        schema: {
            tags: ["Metadata"],
            querystring: metadataSeriesChangesSchema
        },
        handler: metadataSeriesChangesController.get
    });
}
