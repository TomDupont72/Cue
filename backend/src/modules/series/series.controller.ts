import { FastifyReply, FastifyRequest } from "fastify";
import { seriesService } from "./series.service.js";
import { SeriesGetParams, SeriesImportPostBody } from "./series.schemas.js";

export const seriesController = {
  async get(request: FastifyRequest<{ Params: SeriesGetParams }>, reply: FastifyReply) {
    const results = await seriesService.seriesGet(request.user.id, request.params);

    return reply.send(results);
  }
};

export const seriesImportController = {
  async post(request: FastifyRequest<{ Body: SeriesImportPostBody }>, reply: FastifyReply) {
    const isWorker = request.worker?.isWorker ?? false;
    const results = await seriesService.seriesImportPost(
      isWorker ? null : request.user.id,
      request.body,
      isWorker
    );

    return reply.send(results);
  }
};
