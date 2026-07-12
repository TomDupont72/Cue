import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

export type AppFastifyInstance = FastifyInstance<any, any, any, any, ZodTypeProvider>;
