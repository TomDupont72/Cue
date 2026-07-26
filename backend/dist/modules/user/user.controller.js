import { userService } from "./user.service.js";
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
    async post(request, reply) {
        const result = await userService.userEpisodePost(request.user.id, request.params);
        return reply.send(result);
    },
    async delete(request, reply) {
        const result = await userService.userEpisodeDelete(request.user.id, request.params);
        return reply.send(result);
    }
};
