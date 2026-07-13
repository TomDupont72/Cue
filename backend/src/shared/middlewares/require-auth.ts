import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/shared/lib/auth.js";
import { unauthorized } from "@/shared/errors/errors.helpers.js";

async function authGuardPlugin(app: FastifyInstance) {
  app.decorate("requireAuth", async (request: FastifyRequest) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers)
    });

    if (!session?.session?.userId) {
      throw unauthorized("You must be logged in");
    }

    request.user = {
      id: session.session.userId
    };
  });
}

export const authGuard = fp(authGuardPlugin, {
  name: "auth-guard"
});

declare module "fastify" {
  interface FastifyInstance {
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user: {
      id: string;
    };
  }
}
