import Fastify from "fastify"
import { env } from "@/config/env.js"
import { tmdbGet } from "@/external/tmdb/tmdb.client.js"
import { logger } from "@/logger/logger.js"

const app = Fastify({
  loggerInstance: logger,
})

app.get("/health", async () => {
  return { status: "ok" }
})

await app.listen({
  port: Number(env.PORT),
  host: env.HOST,
})