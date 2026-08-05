import { FastifyReply, FastifyRequest } from "fastify";
import {
  UserEpisodeDeleteParams,
  UserEpisodePostParams,
  UserSeasonDeleteParams,
  UserSeasonPostParams,
  UserSeriesGetParams,
  UserSeriesPostBody,
  UserSeriesPostParams,
  UserStatusRecalculate
} from "@/modules/user/user.schemas.js";
import { userService } from "@/modules/user/user.service.js";

export const userSeriesController = {
  async get(request: FastifyRequest<{ Querystring: UserSeriesGetParams }>, reply: FastifyReply) {
    const result = await userService.userSeriesGet(request.user.id, request.query);

    return reply.send(result);
  },

  async post(
    request: FastifyRequest<{ Params: UserSeriesPostParams; Body: UserSeriesPostBody }>,
    reply: FastifyReply
  ) {
    const result = await userService.userSeriesPost(request.user.id, request.params, request.body);

    return reply.send(result);
  }
};

export const userEpisodeController = {
  async getFeed(request: FastifyRequest, reply: FastifyReply) {
    const result = await userService.userEpisodeFeedGet(request.user.id);

    return reply.send(result);
  },

  async post(request: FastifyRequest<{ Params: UserEpisodePostParams }>, reply: FastifyReply) {
    const result = await userService.userEpisodePost(request.user.id, request.params);

    return reply.send(result);
  },

  async delete(request: FastifyRequest<{ Params: UserEpisodeDeleteParams }>, reply: FastifyReply) {
    const result = await userService.userEpisodeDelete(request.user.id, request.params);

    return reply.send(result);
  }
};

export const userSeasonController = {
  async post(request: FastifyRequest<{ Params: UserSeasonPostParams }>, reply: FastifyReply) {
    const result = await userService.userSeasonPost(request.user.id, request.params);

    return reply.send(result);
  },

  async delete(request: FastifyRequest<{ Params: UserSeasonDeleteParams }>, reply: FastifyReply) {
    const result = await userService.userSeasonDelete(request.user.id, request.params);

    return reply.send(result);
  }
};

export const userDashboardSummaryController = {
  async get(request: FastifyRequest, reply: FastifyReply) {
    const result = await userService.userDashboardSummaryGet(request.user.id);

    return reply.send(result);
  }
};

export const userStatusController = {
  async post(request: FastifyRequest<{ Params: UserStatusRecalculate }>, reply: FastifyReply) {
    const result = await userService.userStatusRecalculatePost(request.params);

    return reply.send(result);
  }
};
