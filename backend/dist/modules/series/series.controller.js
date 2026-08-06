import { seriesService } from "./series.service.js";
export const seriesController = {
    async get(request, reply) {
        const results = await seriesService.seriesGet(request.user.id, request.params);
        return reply.send(results);
    }
};
export const seriesImportController = {
    async post(request, reply) {
        const isWorker = request.worker?.isWorker ?? false;
        const results = await seriesService.seriesImportPost(isWorker ? null : request.user.id, request.body, isWorker);
        return reply.send(results);
    }
};
