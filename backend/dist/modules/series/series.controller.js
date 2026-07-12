import { seriesService } from "./series.service.js";
export const seriesImportController = {
    async handle(request, reply) {
        const results = await seriesService.seriesImport(request.body);
        return reply.send(results);
    }
};
