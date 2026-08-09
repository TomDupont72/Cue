import Fastify from "fastify";
import fastifyAuth from "@fastify/auth";
import fastifyCors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from "fastify-type-provider-zod";
import { readFileSync } from "node:fs";
import { z } from "zod";
import { authRoutes } from "@/modules/auth/auth.routes.js";
import { metadataRoutes } from "@/modules/metadata/metadata.routes.js";
import { seriesRoutes } from "@/modules/series/series.routes.js";
import { userRoutes } from "@/modules/user/user.routes.js";
import { env } from "@/shared/config/env.js";
import { toErrorResponse } from "@/shared/errors/errors.handler.js";
import { errorResponseSchema } from "@/shared/errors/errors.schemas.js";
import { logger } from "@/shared/logger/logger.js";
import { authGuard } from "@/shared/middlewares/require-auth.js";
import { workerGuard } from "@/shared/middlewares/require-worker.js";

type BuildAppOptions = {
  openapi?: boolean;
  docs?: boolean;
};

type PackageManifest = {
  version: string;
};

const healthResponseSchema = z.object({ status: z.literal("ok") }).meta({
  id: "HealthResponse"
});

function getApiVersion(): string {
  const packageManifest: unknown = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8")
  );

  if (
    typeof packageManifest !== "object" ||
    packageManifest === null ||
    !("version" in packageManifest) ||
    typeof packageManifest.version !== "string"
  ) {
    throw new TypeError("The backend package version is missing");
  }

  return (packageManifest as PackageManifest).version;
}

export async function buildApp(options: BuildAppOptions = {}) {
  const openapiEnabled = options.openapi ?? env.NODE_ENV !== "production";
  const docsEnabled = options.docs ?? openapiEnabled;

  if (docsEnabled && !openapiEnabled) {
    throw new TypeError("OpenAPI must be enabled when the documentation UI is enabled");
  }

  const app = Fastify({
    loggerInstance: logger
  }).withTypeProvider<ZodTypeProvider>();

  await app.register(fastifyCors, {
    origin: env.CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler((error, request, reply) => {
    const response = toErrorResponse(error);

    if (response.statusCode >= 500) {
      request.log.error({ err: error }, "Request failed");
    }

    return reply.status(response.statusCode).send(response);
  });

  app.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema?.response || routeOptions.schema.hide) {
      return;
    }

    routeOptions.schema.response = {
      ...routeOptions.schema.response,
      default: errorResponseSchema
    };
  });

  if (openapiEnabled) {
    await app.register(swagger, {
      openapi: {
        info: {
          title: "Cue API",
          version: getApiVersion()
        },
        tags: [
          {
            name: "Health",
            description: "État de l'API"
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
        ],
        components: {
          securitySchemes: {
            sessionCookie: {
              type: "apiKey",
              in: "cookie",
              name: "__Secure-better-auth.session_token",
              description:
                "Cookie de session Better Auth en production (sans le préfixe __Secure- en HTTP local)"
            },
            workerBearer: {
              type: "http",
              scheme: "bearer",
              description: "Jeton privé utilisé par le worker Cue"
            }
          }
        }
      },
      transform: jsonSchemaTransform,
      transformObject: jsonSchemaTransformObject
    });

    if (docsEnabled) {
      await app.register(swaggerUI, {
        routePrefix: "/docs"
      });
    }
  }

  app.get(
    "/health",
    {
      schema: {
        operationId: "getHealth",
        tags: ["Health"],
        response: {
          200: healthResponseSchema
        }
      }
    },
    async () => {
      return { status: "ok" as const };
    }
  );

  await app.register(authRoutes, { prefix: "/api/auth" });

  await app.register(fastifyAuth);
  await app.register(authGuard);
  await app.register(workerGuard);

  await app.register(metadataRoutes, { prefix: "/api/metadata" });
  await app.register(seriesRoutes, { prefix: "/api/series" });
  await app.register(userRoutes, { prefix: "/api/user" });

  return app;
}
