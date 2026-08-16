import { FastifyReply, FastifyRequest } from "fastify";
import { seriesService } from "./series.service.js";
import {
  SeriesGetParams,
  SeriesImportPostBody,
  SeriesReconcilePostBody
} from "./series.schemas.js";

export const seriesController = {
  async get(request: FastifyRequest<{ Params: SeriesGetParams }>, reply: FastifyReply) {
    const results = await seriesService.get(request.user.id, request.params);

    return reply.send(results);
  }
};

export const seriesImportController = {
  async post(request: FastifyRequest<{ Body: SeriesImportPostBody }>, reply: FastifyReply) {
    const isWorker = request.worker?.isWorker ?? false;
    const results = await seriesService.importPost(
      request.worker?.isWorker ? null : request.user.id,
      request.body,
      isWorker
    );

    return reply.send(results);
  }
};

export const seriesReconcileController = {
  async post(request: FastifyRequest<{ Body: SeriesReconcilePostBody }>, reply: FastifyReply) {
    const result = await seriesService.reconcilePost(request.body);

    return reply.send(result);
  }
};
