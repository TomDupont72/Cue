import "dotenv/config"
import { z } from "zod";

const envSchema = z.object({
  HOST: z.string().default("localhost"),
  PORT: z.coerce.number().default(8000),
});

export const env = envSchema.parse(process.env);