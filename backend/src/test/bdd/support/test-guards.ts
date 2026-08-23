import fp from "fastify-plugin";
import { unauthorized } from "@/shared/errors/errors.helpers.js";

export type TestIdentity = {
  userId: string | null;
  isWorker: boolean;
};

export function createTestGuards(identity: TestIdentity) {
  return fp(async (app) => {
    app.decorate("requireAuth", async (request) => {
      if (identity.userId === null) {
        throw unauthorized("You must be logged in");
      }

      request.user = {
        id: identity.userId
      };
    });

    app.decorate("requireWorker", async (request) => {
      if (!identity.isWorker) {
        throw unauthorized();
      }

      request.worker = {
        isWorker: true
      };
    });
  });
}
