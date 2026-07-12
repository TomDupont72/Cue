import type { FastifyReply, FastifyRequest } from "fastify";
import type { SeriesSearch } from "./metadata.schemas.js";
import { metadataService } from "./metadata.service.js";

export const seriesSearchController = {
  async search(
    request: FastifyRequest<{ Querystring: SeriesSearch }>,
    reply: FastifyReply,
  ) {
    const results = await metadataService.searchSeries(request.query);

    return reply.send(results);
  },
};