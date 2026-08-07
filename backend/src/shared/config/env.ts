import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["developpement", "production"]).default("developpement"),
  HOST: z.string().default("localhost"),
  PORT: z.coerce.number().default(8000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().min(1),
  CLIENT_ORIGIN: z.string().min(1),
  WORKER_TOKEN: z.string().min(32).optional(),
  TMDB_API_TOKEN: z.string().min(32),
  TMDB_API_KEY: z.string().min(16)
});

export const env = envSchema.parse(process.env);
