import Fastify from "fastify";
import { env } from "@/config/env.js";
import { logger } from "@/logger/logger.js";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { authRoutes } from "./modules/auth/auth.routes.js";

const app = Fastify({
  loggerInstance: logger
});

if (env.NODE_ENV != "prod") {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Cue API",
        version: "1.0.0"
      }
    }
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs"
  });
}

app.get("/health", async () => {
  return { status: "ok" };
});

await app.register(authRoutes, { prefix: "/api/auth" });

await app.listen({
  port: Number(env.PORT),
  host: env.HOST
});
