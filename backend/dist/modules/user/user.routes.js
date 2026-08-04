import { userEpisodeDeleteParamsSchema, userEpisodePostParamsSchema, userStatusRecalculateSchema, userSeasonDeleteParamsSchema, userSeasonPostParamsSchema, userSeriesGetParamsSchema, userSeriesPostBodySchema, userSeriesPostParamsSchema } from "../../modules/user/user.schemas.js";
import { userDashboardSummaryController, userEpisodeController, userSeasonController, userSeriesController, userStatusController } from "../../modules/user/user.controller.js";
import { isWorkerRequest } from "../../shared/middlewares/verify-worker-request.js";
import { unauthorized } from "../../shared/errors/errors.helpers.js";
export async function userRoutes(app) {
    app.get("/series", {
        preHandler: [app.requireAuth],
        schema: {
            tags: ["User"],
            querystring: userSeriesGetParamsSchema
        },
        handler: userSeriesController.get
    });
    app.get("/dashboard/summary", {
        preHandler: [app.requireAuth],
        schema: {
            tags: ["User"]
        },
        handler: userDashboardSummaryController.get
    });
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
    app.post("/series/:seriesId/season/:seasonId", {
        preHandler: [app.requireAuth],
        schema: {
            tags: ["User"],
            params: userSeasonPostParamsSchema
        },
        handler: userSeasonController.post
    });
    app.delete("/series/:seriesId/season/:seasonId", {
        preHandler: [app.requireAuth],
        schema: {
            tags: ["User"],
            params: userSeasonDeleteParamsSchema
        },
        handler: userSeasonController.delete
    });
    app.post("/status/:userId/recalculate", {
        preHandler: [
            async (request) => {
                if (!isWorkerRequest(request)) {
                    throw unauthorized("Invalid worker token");
                }
            }
        ],
        schema: {
            tags: ["User"],
            params: userStatusRecalculateSchema
        },
        handler: userStatusController.post
    });
}
