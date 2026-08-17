import assert from "node:assert/strict";
import type { LightMyRequestResponse } from "fastify";
import type { ApiWorld } from "@/test/bdd/support/world.js";
import { parseHttpCase } from "./http-case.parser.js";
import { assertResponseBody } from "./http-response.assertions.js";
import type { HttpContractCase, RawHttpCase } from "./http-case.types.js";

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function createAggregateError(message: string, errors: Error[]) {
  return new AggregateError(
    errors,
    [message, ...errors.map((error, index) => `${index + 1}. ${error.message}`)].join("\n")
  );
}

function assertHttpCase(
  response: LightMyRequestResponse,
  httpCase: HttpContractCase,
  label: string
) {
  const failures: Error[] = [];

  try {
    assert.equal(
      response.statusCode,
      httpCase.expectedStatus,
      [
        `${label} returned ${response.statusCode}`,
        `Expected: ${httpCase.expectedStatus}`,
        `Body: ${response.body}`
      ].join("\n")
    );
  } catch (error) {
    failures.push(asError(error));
  }

  try {
    assertResponseBody(response, httpCase.responseFixture);
  } catch (error) {
    failures.push(asError(error));
  }

  if (failures.length > 0) {
    throw createAggregateError(`${label} failed`, failures);
  }
}

export async function runHttpContract(
  world: ApiWorld,
  method: string,
  pathTemplate: string,
  rows: readonly RawHttpCase[]
) {
  if (rows.length === 0) {
    throw new Error("The HTTP contract table must contain at least one case");
  }

  const cases = rows.map((row, index) => {
    try {
      return parseHttpCase(method, pathTemplate, row);
    } catch (error) {
      const normalized = asError(error);

      throw new Error(`Invalid HTTP contract row ${index + 1}: ${normalized.message}`, {
        cause: error
      });
    }
  });

  const failures: Error[] = [];

  for (const [index, httpCase] of cases.entries()) {
    const label = `case ${index + 1}: ` + `${httpCase.request.method} ` + `${httpCase.request.url}`;

    try {
      await world.prepareCase(httpCase.state);

      const app = world.app;

      assert.ok(app, "HTTP application was not prepared");

      const response = await app.inject(httpCase.request);

      assertHttpCase(response, httpCase, label);
    } catch (error) {
      const normalized = asError(error);

      failures.push(new Error(`${label}: ${normalized.message}`, { cause: error }));
    } finally {
      try {
        await world.disposeCase();
      } catch (error) {
        const normalized = asError(error);

        failures.push(
          new Error(`${label} cleanup failed: ${normalized.message}`, { cause: error })
        );
      }
    }
  }

  if (failures.length > 0) {
    throw createAggregateError(`${failures.length} HTTP contract failure(s)`, failures);
  }
}
