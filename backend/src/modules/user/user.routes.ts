import { AppFastifyInstance } from "@/shared/types/fastify.js";
import { userSeriesPostBodySchema, userSeriesPostParamsSchema } from "./user.schemas.js";
import { userSeriesController } from "./user.controller.js";

export async function userRoutes(app: AppFastifyInstance) {
  app.post("/series/:seriesId", {
    preHandler: [app.requireAuth],
    schema: {
      params: userSeriesPostParamsSchema,
      body: userSeriesPostBodySchema
    },
    handler: userSeriesController.post
  });
}
