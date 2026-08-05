import { userService } from "../../modules/user/user.service.js";
export const userSeriesController = {
    async get(request, reply) {
        const result = await userService.userSeriesGet(request.user.id, request.query);
        return reply.send(result);
    },
    async post(request, reply) {
        const result = await userService.userSeriesPost(request.user.id, request.params, request.body);
        return reply.send(result);
    }
};
export const userEpisodeController = {
    async getFeed(request, reply) {
        const result = await userService.userEpisodeFeedGet(request.user.id);
        return reply.send(result);
    },
    async post(request, reply) {
        const result = await userService.userEpisodePost(request.user.id, request.params);
        return reply.send(result);
    },
    async delete(request, reply) {
        const result = await userService.userEpisodeDelete(request.user.id, request.params);
        return reply.send(result);
    }
};
export const userSeasonController = {
    async post(request, reply) {
        const result = await userService.userSeasonPost(request.user.id, request.params);
        return reply.send(result);
    },
    async delete(request, reply) {
        const result = await userService.userSeasonDelete(request.user.id, request.params);
        return reply.send(result);
    }
};
export const userDashboardSummaryController = {
    async get(request, reply) {
        const result = await userService.userDashboardSummaryGet(request.user.id);
        return reply.send(result);
    }
};
export const userStatusController = {
    async post(request, reply) {
        const result = await userService.userStatusRecalculatePost(request.params);
        return reply.send(result);
    }
};
