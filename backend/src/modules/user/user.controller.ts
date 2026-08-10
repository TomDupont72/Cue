import { FastifyReply, FastifyRequest } from "fastify";
import {
  UserEpisodeDeleteParams,
  UserEpisodePostParams,
  UserSeasonDeleteParams,
  UserSeasonPostParams,
  UserSeasonPostResponse,
  UserSeriesGetParams,
  UserSeriesGetResponse,
  UserSeriesPostBody,
  UserSeriesPostParams,
  UserSeriesPostResponse,
  UserStatusRecalculate,
  UserStatusRecalculateResponse,
  UserDashboardSummaryGetResponse,
  UserEpisodeDeleteResponse,
  UserEpisodeFeedGetResponse,
  UserEpisodePostResponse,
  UserSeasonDeleteResponse
} from "@/modules/user/user.schemas.js";
import { userService } from "@/modules/user/user.service.js";

export const userSeriesController = {
  async get(
    request: FastifyRequest<{ Querystring: UserSeriesGetParams }>,
    reply: FastifyReply<{ Reply: UserSeriesGetResponse }>
  ) {
    const result = await userService.userSeriesGet(request.user.id, request.query);

    return reply.send(result);
  },

  async post(
    request: FastifyRequest<{ Params: UserSeriesPostParams; Body: UserSeriesPostBody }>,
    reply: FastifyReply<{ Reply: UserSeriesPostResponse }>
  ) {
    const result = await userService.userSeriesPost(request.user.id, request.params, request.body);

    return reply.send(result);
  }
};

export const userEpisodeController = {
  async getFeed(
    request: FastifyRequest,
    reply: FastifyReply<{ Reply: UserEpisodeFeedGetResponse }>
  ) {
    const result = await userService.userEpisodeFeedGet(request.user.id);

    return reply.send(result);
  },

  async post(
    request: FastifyRequest<{ Params: UserEpisodePostParams }>,
    reply: FastifyReply<{ Reply: UserEpisodePostResponse }>
  ) {
    const result = await userService.userEpisodePost(request.user.id, request.params);

    return reply.send(result);
  },

  async delete(
    request: FastifyRequest<{ Params: UserEpisodeDeleteParams }>,
    reply: FastifyReply<{ Reply: UserEpisodeDeleteResponse }>
  ) {
    const result = await userService.userEpisodeDelete(request.user.id, request.params);

    return reply.send(result);
  }
};

export const userSeasonController = {
  async post(
    request: FastifyRequest<{ Params: UserSeasonPostParams }>,
    reply: FastifyReply<{ Reply: UserSeasonPostResponse }>
  ) {
    const result = await userService.userSeasonPost(request.user.id, request.params);

    return reply.send(result);
  },

  async delete(
    request: FastifyRequest<{ Params: UserSeasonDeleteParams }>,
    reply: FastifyReply<{ Reply: UserSeasonDeleteResponse }>
  ) {
    const result = await userService.userSeasonDelete(request.user.id, request.params);

    return reply.send(result);
  }
};

export const userDashboardSummaryController = {
  async get(
    request: FastifyRequest,
    reply: FastifyReply<{ Reply: UserDashboardSummaryGetResponse }>
  ) {
    const result = await userService.userDashboardSummaryGet(request.user.id);

    return reply.send(result);
  }
};

export const userStatusController = {
  async postAll(
    _request: FastifyRequest,
    reply: FastifyReply<{ Reply: UserStatusRecalculateResponse }>
  ) {
    const result = await userService.allUserStatusesRecalculatePost();

    return reply.send(result);
  },

  async post(
    request: FastifyRequest<{ Params: UserStatusRecalculate }>,
    reply: FastifyReply<{ Reply: UserStatusRecalculateResponse }>
  ) {
    const result = await userService.userStatusRecalculatePost(request.params);

    return reply.send(result);
  }
};
