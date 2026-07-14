import { FastifyReply, FastifyRequest } from "fastify";
import { UserSeriesPostBody, UserSeriesPostParams } from "./user.schemas.js";
import { userService } from "./user.service.js";

export const userSeriesController = {
  async post(
    request: FastifyRequest<{ Params: UserSeriesPostParams; Body: UserSeriesPostBody }>,
    reply: FastifyReply
  ) {
    const result = await userService.userSeriesPost(request.user.id, request.params, request.body);

    return reply.send(result);
  }
};
