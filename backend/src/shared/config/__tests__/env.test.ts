import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ZodError } from "zod";
import { parseEnv } from "../env.schema.js";

const validEnv = {
  NODE_ENV: "test",
  HOST: "localhost",
  DATABASE_URL: "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  BETTER_AUTH_SECRET: "test-better-auth-secret-at-least-32-characters",
  BETTER_AUTH_URL: "http://localhost:8000",
  CLIENT_ORIGIN: "http://localhost:5173",
  WORKER_TOKEN: "test-worker-token-at-least-32-characters",
  TMDB_API_TOKEN: "test-tmdb-token-at-least-32-characters",
  TMDB_API_KEY: "test-tmdb-api-key-placeholder"
} satisfies NodeJS.ProcessEnv;

describe("environment configuration", () => {
  for (const nodeEnv of ["development", "test", "production"] as const) {
    it(`accepts NODE_ENV=${nodeEnv}`, () => {
      const result = parseEnv({ ...validEnv, NODE_ENV: nodeEnv });

      assert.equal(result.NODE_ENV, nodeEnv);
    });
  }

  for (const nodeEnv of ["dev", "prod", "developpement"]) {
    it(`rejects the legacy NODE_ENV=${nodeEnv}`, () => {
      assert.throws(() => parseEnv({ ...validEnv, NODE_ENV: nodeEnv }), ZodError);
    });
  }

  it("requires NODE_ENV", () => {
    assert.throws(() => parseEnv({ ...validEnv, NODE_ENV: undefined }), ZodError);
  });

  it("requires HOST", () => {
    assert.throws(() => parseEnv({ ...validEnv, HOST: undefined }), ZodError);
  });

  it("rejects an empty HOST", () => {
    assert.throws(() => parseEnv({ ...validEnv, HOST: "" }), ZodError);
  });
});
