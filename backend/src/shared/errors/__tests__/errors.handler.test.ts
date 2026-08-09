import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AppError } from "../AppError.js";
import { badRequest } from "../errors.helpers.js";
import { toErrorResponse } from "../errors.handler.js";

describe("toErrorResponse", () => {
  it("preserves application error codes and details", () => {
    const response = toErrorResponse(
      badRequest("INVALID_CURSOR", "The cursor is invalid", [{ path: ["cursor"] }])
    );

    assert.deepEqual(response, {
      statusCode: 400,
      code: "INVALID_CURSOR",
      error: "Bad Request",
      message: "The cursor is invalid",
      details: [{ path: ["cursor"] }]
    });
  });

  it("keeps Fastify validation details in the public error contract", () => {
    const response = toErrorResponse({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      message: "querystring/startDate Invalid ISO date",
      validation: [{ instancePath: "/startDate" }]
    });

    assert.deepEqual(response, {
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "querystring/startDate Invalid ISO date",
      details: [{ instancePath: "/startDate" }]
    });
  });

  it("normalizes unknown failures to a stable internal error", () => {
    assert.deepEqual(toErrorResponse(new Error("Unexpected failure")), {
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
      error: "Internal Server Error",
      message: "Internal Server Error"
    });
  });

  it("does not expose application error details for server failures", () => {
    assert.deepEqual(
      toErrorResponse(
        new AppError("DATABASE_UNAVAILABLE", 503, "Database connection failed", {
          host: "internal-database"
        })
      ),
      {
        statusCode: 503,
        code: "SERVICE_UNAVAILABLE",
        error: "Service Unavailable",
        message: "Service Unavailable"
      }
    );
  });
});
