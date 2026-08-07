import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/shared/db/prisma.js";
import { env } from "@/shared/config/env.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [env.CLIENT_ORIGIN],
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    storage: "memory"
  }
});

export default auth;
