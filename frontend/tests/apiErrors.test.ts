import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ApiError, createApiError, normalizeApiClientError } from "../src/api/errors.ts";

describe("createApiError", () => {
  it("preserves a valid OpenAPI error response", () => {
    const error = createApiError(
      {
        statusCode: 409,
        code: "SERIES_ALREADY_EXISTS",
        error: "Conflict",
        message: "Cette série existe déjà.",
        details: { seriesId: 42 }
      },
      409
    );

    assert.equal(error.status, 409);
    assert.equal(error.code, "SERIES_ALREADY_EXISTS");
    assert.equal(error.message, "Cette série existe déjà.");
    assert.deepEqual(error.details, { seriesId: 42 });
  });

  it("does not trust a response body outside the OpenAPI error contract", () => {
    const error = createApiError(
      {
        code: "LEGACY_ERROR",
        message: "Unvalidated message"
      },
      500
    );

    assert.equal(error.status, 500);
    assert.equal(error.code, undefined);
    assert.equal(error.message, "Request failed with status 500");
    assert.equal(error.details, undefined);
  });

  it("rejects a body whose status does not match the HTTP response", () => {
    const error = createApiError(
      {
        statusCode: 401,
        code: "UNAUTHORIZED",
        error: "Unauthorized",
        message: "Unauthorized"
      },
      403,
      true
    );

    assert.equal(error.status, 403);
    assert.equal(error.code, undefined);
    assert.equal(error.message, "Request failed with status 403");
    assert.equal(error.isSessionExpired, true);
  });
});

describe("normalizeApiClientError", () => {
  it("preserves parsing and contract errors returned with a successful HTTP status", async () => {
    const parsingError = new SyntaxError("Invalid JSON");
    let recoveryCount = 0;

    const result = await normalizeApiClientError(
      parsingError,
      new Response(null, { status: 200 }),
      async () => {
        recoveryCount += 1;
        return "session-active";
      }
    );

    assert.equal(result, parsingError);
    assert.equal(recoveryCount, 0);
  });

  it("marks a 401 when session recovery confirms expiration", async () => {
    const result = await normalizeApiClientError(
      {
        statusCode: 401,
        code: "UNAUTHORIZED",
        error: "Unauthorized",
        message: "La session a expiré."
      },
      new Response(null, { status: 401 }),
      async () => "session-expired"
    );

    assert.ok(result instanceof ApiError);
    assert.equal(result.status, 401);
    assert.equal(result.code, "UNAUTHORIZED");
    assert.equal(result.isSessionExpired, true);
  });
});
