import Fastify from "fastify";
import { env } from "@/shared/config/env.js";
import { logger } from "@/shared/logger/logger.js";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { authRoutes } from "@/modules/auth/auth.routes.js";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from "fastify-type-provider-zod";
import { authGuard } from "@/shared/middlewares/require-auth.js";
import { metadataRoutes } from "@/modules/metadata/metadata.routes.js";
import { seriesRoutes } from "@/modules/series/series.routes.js";
import { userRoutes } from "@/modules/user/user.routes.js";
import fastifyCors from "@fastify/cors";
import { workerGuard } from "@/shared/middlewares/require-worker.js";
import fastifyAuth from "@fastify/auth";
import { z } from "zod";
import { apiErrorHandler } from "@/shared/errors/errors.handler.js";
import type { FastifyError, FastifyPluginAsync } from "fastify";

export type BuildAppOptions = {
  loggerEnabled?: boolean;
  docs?: boolean;
  guardPlugins?: FastifyPluginAsync[];
};

export async function buildApp({
  loggerEnabled = true,
  docs = env.NODE_ENV !== "production",
  guardPlugins = [authGuard, workerGuard]
}: BuildAppOptions = {}) {
  const appOptions = loggerEnabled ? { loggerInstance: logger } : { logger: false as const };

  const app = Fastify(appOptions).withTypeProvider<ZodTypeProvider>();

  app.register(fastifyCors, {
    origin: env.CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler<FastifyError>(apiErrorHandler);

  if (docs) {
    await app.register(swagger, {
      openapi: {
        info: {
          title: "Cue API",
          version: "0.9.7"
        },
        tags: [
          {
            name: "Health",
            description: "État de l'API"
          },
          {
            name: "Authentication",
            description: "Authentication"
          },
          {
            name: "Metadata",
            description: "Recherche de métadonnées"
          },
          {
            name: "Series",
            description: "Gestion des séries"
          },
          {
            name: "User",
            description: "Gestion des données utilisateur"
          }
        ]
      },

      transform: jsonSchemaTransform
    });

    await app.register(swaggerUI, {
      routePrefix: "/docs"
    });
  }

  app.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        response: {
          200: z.object({ status: z.literal("ok") })
        }
      }
    },
    async () => {
      return { status: "ok" as const };
    }
  );

  await app.register(authRoutes, { prefix: "/api/auth" });

  await app.register(fastifyAuth);

  for (const guardPlugin of guardPlugins) {
    await app.register(guardPlugin);
  }

  await app.register(metadataRoutes, { prefix: "/api/metadata" });
  await app.register(seriesRoutes, { prefix: "/api/series" });
  await app.register(userRoutes, { prefix: "/api/user" });

  await app.ready();

  return app;
}

export type AppInstance = Awaited<ReturnType<typeof buildApp>>;
