import assert from "node:assert/strict";
import { it } from "node:test";
import { buildApp } from "@/app.js";
import { env } from "@/shared/config/env.js";

it("does not expose OpenAPI or its documentation in production", async (t) => {
  const previousNodeEnvironment = env.NODE_ENV;
  env.NODE_ENV = "production";
  t.after(() => {
    env.NODE_ENV = previousNodeEnvironment;
  });

  const app = await buildApp();
  t.after(() => app.close());
  await app.ready();

  const response = await app.inject({ method: "GET", url: "/docs" });

  assert.equal(response.statusCode, 404);
  assert.equal("swagger" in app, false);
});
