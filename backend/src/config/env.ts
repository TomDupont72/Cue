import "dotenv/config"
import { z } from "zod";

const envSchema = z.object({
  HOST: z.string().default("localhost"),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().min(1),
  CLIENT_ORIGIN: z.string().min(1),
});

export const env = envSchema.parse(process.env);