import { seriesService } from "./series.service.js";
import { isWorkerRequest } from "../../shared/middlewares/verify-worker-request.js";
export const seriesController = {
    async get(request, reply) {
        const results = await seriesService.seriesGet(request.user.id, request.params);
        return reply.send(results);
    }
};
export const seriesImportController = {
    async post(request, reply) {
        const workerRequest = isWorkerRequest(request);
        const results = await seriesService.seriesImportPost(workerRequest ? null : request.user.id, request.body, workerRequest);
        return reply.send(results);
    }
};
