import Fastify, { type FastifyError } from "fastify";
import { validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import { AppError } from "../AppError.js";
import { apiErrorHandler } from "../errors.handler.js";

function buildApp() {
  const app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setErrorHandler<FastifyError>(apiErrorHandler);

  app.get("/app-error", async () => {
    throw new AppError("INVALID_STATE", 400, "Invalid state", { field: "status" });
  });

  app.get(
    "/validation-error",
    {
      schema: {
        querystring: z.object({ id: z.coerce.number().int().min(1) })
      }
    },
    async () => ({ status: "ok" })
  );

  app.get("/internal-error", async () => {
    throw new Error("Database failed at postgresql://user:password@database:5432/cue");
  });

  return app;
}

describe("API error handler", { concurrency: false }, () => {
  it("serializes application errors and their details", async () => {
    const app = buildApp();

    const response = await app.inject("/app-error");

    assert.equal(response.statusCode, 400);
    assert.deepEqual(response.json(), {
      code: "INVALID_STATE",
      message: "Invalid state",
      details: { field: "status" }
    });

    await app.close();
  });

  it("normalizes validation errors", async () => {
    const app = buildApp();

    const response = await app.inject("/validation-error?id=invalid");
    const body = response.json();

    assert.equal(response.statusCode, 400);
    assert.equal(body.code, "VALIDATION_ERROR");
    assert.equal(body.message, "Invalid request");
    assert.ok(Array.isArray(body.details));

    await app.close();
  });

  it("hides unexpected error details", async () => {
    const app = buildApp();

    const response = await app.inject("/internal-error");

    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.json(), {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error"
    });
    assert.equal(response.body.includes("postgresql://"), false);

    await app.close();
  });
});
