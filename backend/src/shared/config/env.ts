import "dotenv/config";
import { parseEnv } from "@/shared/config/env.schema.js";

export const env = parseEnv(process.env);
