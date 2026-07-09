import Fastify from "fastify"
import { env } from "@/config/env.js"

const app = Fastify({
  logger: true,
})

app.get("/health", async () => {
  return { status: "ok" }
})

await app.listen({
  port: Number(env.PORT),
  host: env.HOST,
})