import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  MetadataSeriesChanges,
  MetadataSeriesChangesResponse,
  MetadataSeriesSearchResponse,
  MetadataSeriesSearch
} from "@/modules/metadata/metadata.schemas.js";
import { metadataService } from "@/modules/metadata/metadata.service.js";

export const metadataSeriesSearchController = {
  async get(
    request: FastifyRequest<{ Querystring: MetadataSeriesSearch }>,
    reply: FastifyReply<{ Reply: MetadataSeriesSearchResponse }>
  ) {
    const results = await metadataService.metadataSeriesSearch(request.query);

    return reply.send(results);
  }
};

export const metadataSeriesChangesController = {
  async get(
    request: FastifyRequest<{ Querystring: MetadataSeriesChanges }>,
    reply: FastifyReply<{ Reply: MetadataSeriesChangesResponse }>
  ) {
    const results = await metadataService.metadataSeriesChanges(request.query);

    return reply.send(results);
  }
};
