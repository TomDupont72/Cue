import { seriesImportSchema } from "./series.schemas.js";
import { seriesImportController } from "./series.controller.js";
export async function seriesRoutes(app) {
    app.post("/import", {
        preHandler: [app.requireAuth],
        schema: {
            body: seriesImportSchema
        },
        handler: seriesImportController.handle
    });
}
