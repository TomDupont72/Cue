import type { FastifyReply, FastifyRequest } from "fastify";
import type { MetadataSeriesSearch } from "./metadata.schemas.js";
import { metadataService } from "./metadata.service.js";

export const metadataSeriesSearchController = {
  async search(
    request: FastifyRequest<{ Querystring: MetadataSeriesSearch }>,
    reply: FastifyReply
  ) {
    const results = await metadataService.metadataSearchSeries(request.query);

    return reply.send(results);
  }
};
