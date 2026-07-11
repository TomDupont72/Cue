import Fastify from "fastify";
import { env } from "@/config/env.js";
import { logger } from "@/logger/logger.js";
import { tvDetails } from "./external/tmdb/tv-details.tmdb.js";

const app = Fastify({
  loggerInstance: logger
});

app.get("/health", async () => {
  console.log(await tvDetails(42009));
  return { status: "ok" };
});

await app.listen({
  port: Number(env.PORT),
  host: env.HOST
});
