import { FastifyReply, FastifyRequest } from "fastify";
import { seriesService } from "./series.service.js";
import { SeriesImport } from "./series.schemas.js";
import { tvDetails } from "@/external/tmdb/tmdb.tv-details.js";

export const seriesImportController = {
  async handle(request: FastifyRequest<{ Body: SeriesImport }>, reply: FastifyReply) {
    const results = await seriesService.seriesImport(request.body);

    return reply.send(results);
  }
};
