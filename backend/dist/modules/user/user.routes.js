import { userEpisodeDeleteParamsSchema, userEpisodePostParamsSchema, userSeriesPostBodySchema, userSeriesPostParamsSchema } from "./user.schemas.js";
import { userEpisodeController, userSeriesController } from "./user.controller.js";
export async function userRoutes(app) {
    app.post("/series/:seriesId", {
        preHandler: [app.requireAuth],
        schema: {
            tags: ["User"],
            params: userSeriesPostParamsSchema,
            body: userSeriesPostBodySchema
        },
        handler: userSeriesController.post
    });
    app.post("/series/:seriesId/episode/:episodeId", {
        preHandler: [app.requireAuth],
        schema: {
            tags: ["User"],
            params: userEpisodePostParamsSchema
        },
        handler: userEpisodeController.post
    });
    app.delete("/series/:seriesId/episode/:episodeId", {
        preHandler: [app.requireAuth],
        schema: {
            tags: ["User"],
            params: userEpisodeDeleteParamsSchema
        },
        handler: userEpisodeController.delete
    });
}
