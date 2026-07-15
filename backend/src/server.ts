import Fastify from "fastify";
import { env } from "./shared/config/env.js";
import { logger } from "./shared/logger/logger.js";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { authRoutes } from "./modules/auth/auth.routes.js";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from "fastify-type-provider-zod";
import { authGuard } from "./shared/middlewares/require-auth.js";
import { metadataRoutes } from "./modules/metadata/metadata.routes.js";
import { seriesRoutes } from "./modules/series/series.routes.js";
import { userRoutes } from "./modules/user/user.routes.js";
import fastifyCors from "@fastify/cors";

const app = Fastify({
  loggerInstance: logger
}).withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: process.env.CLIENT_ORIGIN,
  credentials: true
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

if (env.NODE_ENV != "prod") {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Cue API",
        version: "1.0.0"
      }
    },
    transform: jsonSchemaTransform
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs"
  });
}

app.get("/health", async () => {
  return { status: "ok" };
});

await app.register(authRoutes, { prefix: "/api/auth" });

await app.register(authGuard);

await app.register(metadataRoutes, { prefix: "/api/metadata" });
await app.register(seriesRoutes, { prefix: "/api/series" });
await app.register(userRoutes, { prefix: "/api/user" });

await app.listen({
  port: Number(env.PORT),
  host: env.HOST
});
