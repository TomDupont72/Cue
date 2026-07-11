import Fastify from "fastify";
import { env } from "@/config/env.js";
import { logger } from "@/logger/logger.js";
import { seasonDetails } from "./external/tmdb/season-details.tmdb.js";

const app = Fastify({
  loggerInstance: logger
});

app.get("/health", async () => {
  console.log(await seasonDetails(42009, 2));
  return { status: "ok" };
});

await app.listen({
  port: Number(env.PORT),
  host: env.HOST
});
