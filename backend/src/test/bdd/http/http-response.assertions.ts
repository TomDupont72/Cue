import assert from "node:assert/strict";
import type { LightMyRequestResponse } from "fastify";

type TableRows = readonly (readonly string[])[];

const NUMBER_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

function parseCell(value: string): unknown {
  if (value === "null") {
    return null;
  }

  if (value === "true" || value === "false") {
    return value === "true";
  }

  if (NUMBER_PATTERN.test(value)) {
    return Number(value);
  }

  return value;
}

function parseTable(rows: TableRows): Record<string, unknown>[] {
  const [headerRow, ...bodyRows] = rows;

  if (!headerRow || headerRow.length === 0) {
    throw new Error("The expected response table must contain a header row");
  }

  if (headerRow.some((header) => header === "")) {
    throw new Error("The expected response table contains an empty column name");
  }

  if (new Set(headerRow).size !== headerRow.length) {
    throw new Error("The expected response table contains duplicate columns");
  }

  return bodyRows.map((row) =>
    Object.fromEntries(headerRow.map((header, index) => [header, parseCell(row[index] ?? "")]))
  );
}

function parseObjectTable(rows: TableRows): Record<string, unknown> {
  const values = parseTable(rows);

  if (values.length !== 1) {
    throw new Error("An expected response object must contain exactly one data row");
  }

  return values[0];
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getValueAtPath(value: unknown, path: string): unknown {
  const segments = path.split(".");

  if (segments.some((segment) => segment === "")) {
    throw new Error(`Invalid response path: "${path}"`);
  }

  let current = value;

  for (const segment of segments) {
    if (typeof current !== "object" || current === null || !Object.hasOwn(current, segment)) {
      throw new Error(`Response path does not exist: "${path}"`);
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

export function assertResponseStatus(response: LightMyRequestResponse, expectedStatus: number) {
  assert.equal(
    response.statusCode,
    expectedStatus,
    [
      `Response returned ${response.statusCode}, expected ${expectedStatus}`,
      `Body: ${response.body}`
    ].join("\n")
  );
}

export function assertResponseFields(response: LightMyRequestResponse, rows: TableRows) {
  const body = parseResponseBody(response);

  if (!isRecord(body)) {
    throw new Error("The response body is not an object");
  }

  const [header, ...fieldRows] = rows;

  if (header?.length !== 1 || header[0] !== "field") {
    throw new Error('The response fields table must contain a single "field" column');
  }

  const expectedFields = fieldRows.map(([field]) => field ?? "");

  if (expectedFields.some((field) => field === "")) {
    throw new Error("The response fields table contains an empty field");
  }

  if (new Set(expectedFields).size !== expectedFields.length) {
    throw new Error("The response fields table contains duplicate fields");
  }

  assert.deepStrictEqual(Object.keys(body).sort(), [...expectedFields].sort());
}

export function assertResponseBodyExact(response: LightMyRequestResponse, rows: TableRows) {
  assert.deepStrictEqual(parseResponseBody(response), parseObjectTable(rows));
}

export function assertResponseBodyPartial(response: LightMyRequestResponse, rows: TableRows) {
  assert.partialDeepStrictEqual(parseResponseBody(response), parseObjectTable(rows));
}

export function assertResponseObjectAtPath(
  response: LightMyRequestResponse,
  path: string,
  rows: TableRows
) {
  assert.deepStrictEqual(getValueAtPath(parseResponseBody(response), path), parseObjectTable(rows));
}

export function assertResponseArrayAtPath(
  response: LightMyRequestResponse,
  path: string,
  rows: TableRows
) {
  assert.deepStrictEqual(getValueAtPath(parseResponseBody(response), path), parseTable(rows));
}

export function assertResponseNullAtPath(response: LightMyRequestResponse, path: string) {
  assert.strictEqual(getValueAtPath(parseResponseBody(response), path), null);
}

export function assertResponseEmptyArrayAtPath(response: LightMyRequestResponse, path: string) {
  assert.deepStrictEqual(getValueAtPath(parseResponseBody(response), path), []);
}
