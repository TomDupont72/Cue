import { FastifyReply, FastifyRequest } from "fastify";
import {
  UserEpisodeDeleteParams,
  UserEpisodePostParams,
  UserSeriesPostBody,
  UserSeriesPostParams
} from "./user.schemas.js";
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

export const userEpisodeController = {
  async post(request: FastifyRequest<{ Params: UserEpisodePostParams }>, reply: FastifyReply) {
    const result = await userService.userEpisodePost(request.user.id, request.params);

    return reply.send(result);
  },

  async delete(request: FastifyRequest<{ Params: UserEpisodeDeleteParams }>, reply: FastifyReply) {
    const result = await userService.userEpisodeDelete(request.user.id, request.params);

    return reply.send(result);
  }
};
