import assert from "node:assert/strict";
import type { LightMyRequestResponse } from "fastify";

type TableRows = readonly (readonly string[])[];

const NUMBER_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

function parseCell(value: string): unknown {
  if (value.startsWith("json:")) {
    try {
      return JSON.parse(value.slice("json:".length)) as unknown;
    } catch (cause) {
      throw new Error(`Invalid JSON response cell: ${value}`, { cause });
    }
  }

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

export function parseObjectTable(rows: TableRows): Record<string, unknown> {
  const values = parseTable(rows);

  if (values.length !== 1) {
    throw new Error("An expected response object must contain exactly one data row");
  }

  return values[0];
}

export function buildExpectedFixtures(
  rows: TableRows,
  resolveFixture: (reference: string) => unknown
) {
  const [headerRow, ...bodyRows] = rows;

  if (!headerRow || headerRow[0] !== "fixture") {
    throw new Error('The fixture table must start with a "fixture" column');
  }

  if (headerRow.some((header) => header === "")) {
    throw new Error("The fixture table contains an empty column name");
  }

  if (new Set(headerRow).size !== headerRow.length) {
    throw new Error("The fixture table contains duplicate columns");
  }

  const extraFields = headerRow.slice(1);

  return bodyRows.map((row) => {
    const reference = row[0];

    if (!reference) {
      throw new Error("The fixture table contains an empty reference");
    }

    const fixture = resolveFixture(reference);

    if (!isRecord(fixture)) {
      throw new Error(`Fixture ${reference} is not an object`);
    }

    const extras = Object.fromEntries(
      extraFields.map((field, index) => [field, parseCell(row[index + 1] ?? "")])
    );

    return {
      ...fixture,
      ...extras
    };
  });
}

function getExpectedField<T>(
  row: Record<string, unknown>,
  field: string,
  isExpectedType: (value: unknown) => value is T,
  expectedType: string
): T {
  const value = row[field];

  if (!isExpectedType(value)) {
    throw new Error(`Expected "${field}" to be ${expectedType}`);
  }

  return value;
}

function getFixtureRecord(
  row: Record<string, unknown>,
  field: string,
  resolveFixture: (reference: string) => unknown
) {
  const reference = getExpectedField(
    row,
    field,
    (value): value is string => typeof value === "string",
    "a fixture reference"
  );
  const fixture = resolveFixture(reference);

  if (!isRecord(fixture)) {
    throw new Error(`Fixture ${reference} is not an object`);
  }

  return fixture;
}

function assertExactFields(row: Record<string, unknown>, expectedFields: readonly string[]) {
  assert.deepStrictEqual(
    Object.keys(row).sort(),
    [...expectedFields].sort(),
    "The expected response table does not contain exactly the required columns"
  );
}

export function buildExpectedUserEpisodePostResponse(
  rows: TableRows,
  resolveFixture: (reference: string) => unknown
) {
  const row = parseObjectTable(rows);
  const commonFields = ["userEpisode", "seriesId"];

  if (row.nextEpisode === null) {
    assertExactFields(row, [...commonFields, "nextEpisode"]);

    return {
      ...getFixtureRecord(row, "userEpisode", resolveFixture),
      seriesId: getExpectedField(
        row,
        "seriesId",
        (value): value is number => typeof value === "number",
        "a number"
      ),
      nextEpisode: null
    };
  }

  assertExactFields(row, [
    ...commonFields,
    "nextEpisode.episode",
    "nextEpisode.userId",
    "nextEpisode.series",
    "nextEpisode.status",
    "nextEpisode.lastWatchedAt",
    "nextEpisode.remainingEpisodes"
  ]);

  const userEpisode = getFixtureRecord(row, "userEpisode", resolveFixture);
  const nextEpisode = getFixtureRecord(row, "nextEpisode.episode", resolveFixture);
  const nextEpisodeSeries = getFixtureRecord(row, "nextEpisode.series", resolveFixture);
  const seriesId = getExpectedField(
    row,
    "seriesId",
    (value): value is number => typeof value === "number",
    "a number"
  );
  const nextEpisodeUserId = getExpectedField(
    row,
    "nextEpisode.userId",
    (value): value is string => typeof value === "string",
    "a string"
  );
  const nextEpisodeStatus = getExpectedField(
    row,
    "nextEpisode.status",
    (value): value is string => typeof value === "string",
    "a string"
  );
  const nextEpisodeLastWatchedAt = row["nextEpisode.lastWatchedAt"];
  const remainingEpisodes = getExpectedField(
    row,
    "nextEpisode.remainingEpisodes",
    (value): value is number => typeof value === "number",
    "a number"
  );

  if (nextEpisodeLastWatchedAt !== null && typeof nextEpisodeLastWatchedAt !== "string") {
    throw new Error('Expected "nextEpisode.lastWatchedAt" to be a date string or null');
  }

  if (nextEpisode.seriesId !== nextEpisodeSeries.id) {
    throw new Error(
      'The fixtures referenced by "nextEpisode.episode" and "nextEpisode.series" belong to different series'
    );
  }

  return {
    ...userEpisode,
    seriesId,
    nextEpisode: {
      userId: nextEpisodeUserId,
      seriesId: nextEpisodeSeries.id,
      status: nextEpisodeStatus,
      lastWatchedAt: nextEpisodeLastWatchedAt,
      seriesName: nextEpisodeSeries.name,
      seriesPosterPath: nextEpisodeSeries.posterPath,
      seriesTmdbId: nextEpisodeSeries.tmdbId,
      id: nextEpisode.id,
      name: nextEpisode.name,
      seasonNumber: nextEpisode.seasonNumber,
      episodeNumber: nextEpisode.episodeNumber,
      airDate: nextEpisode.airDate,
      stillPath: nextEpisode.stillPath,
      runtime: nextEpisode.runtime,
      overview: nextEpisode.overview,
      remainingEpisodes
    }
  };
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

function serializeFixture(value: unknown): unknown {
  const serialized = JSON.stringify(value);

  if (serialized === undefined) {
    throw new Error("The database fixture cannot be represented as JSON");
  }

  return JSON.parse(serialized) as unknown;
}

function getValueAtPath(value: unknown, path: string): unknown {
  if (path === "$") {
    return value;
  }

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

export function assertResponseBodyMatchesFixture(
  response: LightMyRequestResponse,
  fixture: unknown
) {
  const body = parseResponseBody(response);

  if (!isRecord(body)) {
    throw new Error("The response body is not an object");
  }

  assert.deepStrictEqual(body, serializeFixture(fixture));
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

export function assertResponseObjectMatchesFixture(
  response: LightMyRequestResponse,
  path: string,
  fixture: unknown
) {
  const value = getValueAtPath(parseResponseBody(response), path);

  if (!isRecord(value)) {
    throw new Error(`The response value at "${path}" is not an object`);
  }

  assert.deepStrictEqual(value, serializeFixture(fixture));
}

export function assertResponseArrayMatchesFixtures(
  response: LightMyRequestResponse,
  path: string,
  fixtures: readonly unknown[]
) {
  const value = getValueAtPath(parseResponseBody(response), path);

  if (!Array.isArray(value)) {
    throw new Error(`The response value at "${path}" is not an array`);
  }

  assert.deepStrictEqual(value, fixtures.map(serializeFixture));
}

export function assertResponseNullAtPath(response: LightMyRequestResponse, path: string) {
  assert.strictEqual(getValueAtPath(parseResponseBody(response), path), null);
}

export function assertResponseEmptyArrayAtPath(response: LightMyRequestResponse, path: string) {
  assert.deepStrictEqual(getValueAtPath(parseResponseBody(response), path), []);
}
