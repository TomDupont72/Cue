import assert from "node:assert/strict";
import type { LightMyRequestResponse } from "fastify";
import { resolveResponse } from "@/test/bdd/fixtures/registry.js";

function normalizeExpectedValue(value: unknown): unknown {
  const serialized = JSON.stringify(value);

  return serialized === undefined ? undefined : (JSON.parse(serialized) as unknown);
}

function getMediaType(response: LightMyRequestResponse): string | undefined {
  const header = response.headers["content-type"];
  const value = Array.isArray(header) ? header[0] : header;

  if (typeof value !== "string") {
    return undefined;
  }

  return value.split(";", 1)[0]?.trim().toLowerCase();
}

function parseResponseBody(response: LightMyRequestResponse): unknown {
  if (response.body === "") {
    return "";
  }

  const mediaType = getMediaType(response);
  const isJson = mediaType === "application/json" || mediaType?.endsWith("+json");

  if (!isJson) {
    return response.body;
  }

  try {
    return JSON.parse(response.body) as unknown;
  } catch (cause) {
    throw new Error(
      `Response declares "${mediaType}" but contains invalid JSON:\n${response.body}`,
      { cause }
    );
  }
}

export function assertResponseBody(response: LightMyRequestResponse, fixtureName: string) {
  const expectation = resolveResponse(fixtureName);
  const actual = parseResponseBody(response);
  const expected = normalizeExpectedValue(expectation.value);

  if (expectation.mode === "partial") {
    assert.partialDeepStrictEqual(actual, expected);
    return;
  }

  assert.deepStrictEqual(actual, expected);
}
