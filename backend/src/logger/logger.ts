import pino from "pino";
import { env } from "@/config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL ?? "info",

  transport:
    env.NODE_ENV === "dev"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,

  redact: {
    paths: [
      "password",
      "passwordHash",
      "token",
      "accessToken",
      "refreshToken",
      "authorization",
      "headers.authorization",
      "cookie",
      "headers.cookie",
    ],
    censor: "[REDACTED]",
  },
});