import { timingSafeEqual } from "node:crypto";
import type { FastifyRequest } from "fastify";
import { env } from "@/shared/config/env.js";

export function isWorkerRequest(request: FastifyRequest) {
  const authorization = request.headers.authorization;
  const match = authorization?.match(/^Bearer (.+)$/i);

  if (!match || !env.WORKER_TOKEN) {
    return false;
  }

  const token = Buffer.from(match[1]);
  const workerToken = Buffer.from(env.WORKER_TOKEN);

  return token.length === workerToken.length && timingSafeEqual(token, workerToken);
}
