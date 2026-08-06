import { seriesGetSchema, seriesImportPostSchema } from "../../modules/series/series.schemas.js";
import { seriesController, seriesImportController } from "../../modules/series/series.controller.js";
export async function seriesRoutes(app) {
    app.get("/:id", {
        preHandler: [app.requireAuth],
        schema: {
            tags: ["Series"],
            params: seriesGetSchema
        },
        handler: seriesController.get
    });
    app.post("/import", {
        preHandler: app.auth([app.requireAuth, app.requireWorker], { relation: "or" }),
        schema: {
            tags: ["Series"],
            body: seriesImportPostSchema
        },
        handler: seriesImportController.post
    });
}
