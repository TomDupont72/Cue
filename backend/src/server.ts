import Fastify from "fastify";
import { env } from "@/config/env.js";
import { logger } from "@/logger/logger.js";
import { episodeDetails } from "./external/tmdb/episode-details.tmdb.js";

const app = Fastify({
  loggerInstance: logger
});

app.get("/health", async () => {
  console.log(await episodeDetails(42009, 7, 3));
  return { status: "ok" };
});

await app.listen({
  port: Number(env.PORT),
  host: env.HOST
});
