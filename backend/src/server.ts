import { buildApp } from "@/app.js";
import { env } from "@/shared/config/env.js";

const app = await buildApp();

await app.listen({
  port: Number(env.PORT),
  host: env.HOST
});
