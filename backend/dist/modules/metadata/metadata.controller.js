import { metadataService } from "../../modules/metadata/metadata.service.js";
export const metadataSeriesSearchController = {
    async get(request, reply) {
        const results = await metadataService.metadataSeriesSearch(request.query);
        return reply.send(results);
    }
};
export const metadataSeriesChangesController = {
    async get(request, reply) {
        const results = await metadataService.metadataSeriesChanges(request.query);
        return reply.send(results);
    }
};
