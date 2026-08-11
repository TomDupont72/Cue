import { FastifyReply, FastifyRequest } from "fastify";
import {
  UserEpisodeDeleteParams,
  UserEpisodePostParams,
  UserSeasonDeleteParams,
  UserSeasonPostParams,
  UserSeriesGet,
  UserSeriesPostBody,
  UserSeriesPostParams,
  UserStatusPostParams
} from "@/modules/user/user.schemas.js";
import { userService } from "@/modules/user/user.service.js";

export const userSeriesController = {
  async get(request: FastifyRequest<{ Querystring: UserSeriesGet }>, reply: FastifyReply) {
    const result = await userService.seriesGet(request.user.id, request.query);

    return reply.send(result);
  },

  async post(
    request: FastifyRequest<{ Params: UserSeriesPostParams; Body: UserSeriesPostBody }>,
    reply: FastifyReply
  ) {
    const result = await userService.seriesPost(request.user.id, request.params, request.body);

    return reply.send(result);
  }
};

export const userEpisodeController = {
  async post(request: FastifyRequest<{ Params: UserEpisodePostParams }>, reply: FastifyReply) {
    const result = await userService.episodePost(request.user.id, request.params);

    return reply.send(result);
  },

  async delete(request: FastifyRequest<{ Params: UserEpisodeDeleteParams }>, reply: FastifyReply) {
    const result = await userService.episodeDelete(request.user.id, request.params);

    return reply.send(result);
  }
};

export const userSeasonController = {
  async post(request: FastifyRequest<{ Params: UserSeasonPostParams }>, reply: FastifyReply) {
    const result = await userService.seasonPost(request.user.id, request.params);

    return reply.send(result);
  },

  async delete(request: FastifyRequest<{ Params: UserSeasonDeleteParams }>, reply: FastifyReply) {
    const result = await userService.seasonDelete(request.user.id, request.params);

    return reply.send(result);
  }
};

export const userDashboardSummaryController = {
  async get(request: FastifyRequest, reply: FastifyReply) {
    const result = await userService.dashboardSummaryGet(request.user.id);

    return reply.send(result);
  }
};

export const userStatusController = {
  async post(request: FastifyRequest<{ Params: UserStatusPostParams }>, reply: FastifyReply) {
    const result = await userService.statusRecalculatePost(request.params);

    return reply.send(result);
  }
};

export const userEpisodeFeedController = {
  async get(request: FastifyRequest, reply: FastifyReply) {
    const result = await userService.episodeFeedGet(request.user.id);

    return reply.send(result);
  }
};
