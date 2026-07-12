import { metadataService } from "./metadata.service.js";
export const metadataSeriesSearchController = {
    async search(request, reply) {
        const results = await metadataService.metadataSearchSeries(request.query);
        return reply.send(results);
    }
};
