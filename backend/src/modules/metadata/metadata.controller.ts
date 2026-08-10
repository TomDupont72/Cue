import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  MetadataSeriesChangesGet,
  MetadataSeriesSearchGet
} from "@/modules/metadata/metadata.schemas.js";
import { metadataService } from "@/modules/metadata/metadata.service.js";

export const metadataSeriesSearchController = {
  async get(
    request: FastifyRequest<{ Querystring: MetadataSeriesSearchGet }>,
    reply: FastifyReply
  ) {
    const results = await metadataService.metadataSeriesSearch(request.query);

    return reply.send(results);
  }
};

export const metadataSeriesChangesController = {
  async get(
    request: FastifyRequest<{ Querystring: MetadataSeriesChangesGet }>,
    reply: FastifyReply
  ) {
    const results = await metadataService.metadataSeriesChanges(request.query);

    return reply.send(results);
  }
};
