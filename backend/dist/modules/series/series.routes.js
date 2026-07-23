import { seriesGetSchema, seriesImportPostSchema } from "./series.schemas.js";
import { seriesController, seriesImportController } from "./series.controller.js";
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
        preHandler: [app.requireAuth],
        schema: {
            tags: ["Series"],
            body: seriesImportPostSchema
        },
        handler: seriesImportController.post
    });
}
