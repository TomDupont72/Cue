import fp from "fastify-plugin";
import bearerAuth from "@fastify/bearer-auth";
import type { FastifyInstance, FastifyReply } from "fastify";

import { env } from "@/shared/config/env.js";

async function workerGuardPlugin(app: FastifyInstance) {
  const workerToken = env.WORKER_TOKEN;

  if (!workerToken) {
    throw new Error("WORKER_TOKEN is required");
  }

  await app.register(bearerAuth, {
    addHook: false,
    keys: new Set([workerToken])
  });

  app.decorate("requireWorker", async (request, reply) => {
    await new Promise<void>((resolve, reject) => {
      app.verifyBearerAuth!(request, reply, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    request.worker = { isWorker: true };
  });
}

export const workerGuard = fp(workerGuardPlugin, {
  name: "worker-guard"
});

declare module "fastify" {
  interface FastifyInstance {
    requireWorker: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    worker?: {
      isWorker: boolean;
    };
  }
}
