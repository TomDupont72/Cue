import { FastifyReply, FastifyRequest } from "fastify";
import { seriesService } from "./series.service.js";
import { SeriesGet, SeriesImportPost } from "./series.schemas.js";

export const seriesController = {
  async get(request: FastifyRequest<{ Params: SeriesGet }>, reply: FastifyReply) {
    const results = await seriesService.seriesGet(request.params);

    return reply.send(results);
  }
};

export const seriesImportController = {
  async post(request: FastifyRequest<{ Body: SeriesImportPost }>, reply: FastifyReply) {
    const results = await seriesService.seriesImportPost(request.body);

    return reply.send(results);
  }
};
