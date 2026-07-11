import Fastify from "fastify";
import { env } from "@/config/env.js";
import { logger } from "@/logger/logger.js";
import { searchSeries } from "./external/tmdb/series.tmdb.js";

const app = Fastify({
  loggerInstance: logger
});

app.get("/health", async () => {
  console.log(await searchSeries("one", 2));
  return { status: "ok" };
});

await app.listen({
  port: Number(env.PORT),
  host: env.HOST
});
