import { seriesService } from "./series.service.js";
export const seriesController = {
    async get(request, reply) {
        const results = await seriesService.seriesGet(request.user.id, request.params);
        return reply.send(results);
    }
};
export const seriesImportController = {
    async post(request, reply) {
        const results = await seriesService.seriesImportPost(request.user.id, request.body);
        return reply.send(results);
    }
};
