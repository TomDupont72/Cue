import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  HOST: z.string().min(1),
  PORT: z.coerce.number().int().min(1).max(65535).default(8000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  CLIENT_ORIGIN: z.url(),
  WORKER_TOKEN: z.string().min(32),
  TMDB_API_TOKEN: z.string().min(32),
  TMDB_API_KEY: z.string().min(16)
});

export function parseEnv(input: NodeJS.ProcessEnv) {
  return envSchema.parse(input);
}
