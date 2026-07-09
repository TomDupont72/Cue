import "dotenv/config"
import Fastify from "fastify"

const app = Fastify({
  logger: true,
})

app.get("/health", async () => {
  return { status: "ok" }
})

await app.listen({
  port: Number(process.env.PORT ?? 8000),
  host: process.env.HOST ?? "127.0.0.1",
})