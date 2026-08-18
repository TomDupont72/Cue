import {
  HTTP_METHODS,
  type HttpContractCase,
  type HttpContractRequest,
  type HttpMethod,
  type RawHttpCase
} from "./http-case.types.js";

export type HttpCaseDraft = {
  state?: string;
  pathParameters: Record<string, string>;
  query: URLSearchParams;
  headers: Record<string, string>;
  payload?: HttpContractRequest["payload"];
  expectedStatus?: number;
  responseFixture?: string;
};

export type ColumnParser = {
  matches(column: string): boolean;

  apply(column: string, value: string, draft: HttpCaseDraft): void;
};

const columnParsers: ColumnParser[] = [];

export function registerColumnParser(parser: ColumnParser) {
  columnParsers.push(parser);
}

registerColumnParser({
  matches: (column) => column === "state",

  apply(_column, value, draft) {
    if (value !== "") {
      draft.state = value;
    }
  }
});

registerColumnParser({
  matches: (column) => column === "status",

  apply(_column, value, draft) {
    const status = Number(value);

    if (!Number.isInteger(status) || status < 100 || status > 599) {
      throw new Error(`Invalid HTTP status: "${value}"`);
    }

    draft.expectedStatus = status;
  }
});

registerColumnParser({
  matches: (column) => column === "response",

  apply(_column, value, draft) {
    if (value === "") {
      throw new Error('Column "response" cannot be empty');
    }

    draft.responseFixture = value;
  }
});

function parseMethod(value: string): HttpMethod {
  const method = value.toUpperCase();

  if (!HTTP_METHODS.includes(method as HttpMethod)) {
    throw new Error(`Unsupported HTTP method: "${value}"`);
  }

  return method as HttpMethod;
}

function getPathParameters(pathTemplate: string) {
  const matches = pathTemplate.matchAll(/<([A-Za-z][A-Za-z0-9_]*)>/g);

  return new Set(Array.from(matches, (match) => match[1]!));
}

export function parseHttpCase(
  methodValue: string,
  pathTemplate: string,
  row: RawHttpCase
): HttpContractCase {
  if (!pathTemplate.startsWith("/")) {
    throw new Error(`HTTP path must start with "/": "${pathTemplate}"`);
  }

  const method = parseMethod(methodValue);
  const expectedPathParameters = getPathParameters(pathTemplate);

  const draft: HttpCaseDraft = {
    pathParameters: {},
    query: new URLSearchParams(),
    headers: {}
  };

  for (const [column, value] of Object.entries(row)) {
    if (expectedPathParameters.has(column)) {
      draft.pathParameters[column] = value;
      continue;
    }

    const matchingParsers = columnParsers.filter((parser) => parser.matches(column));

    if (matchingParsers.length === 0) {
      throw new Error(`Unknown HTTP contract column: "${column}"`);
    }

    if (matchingParsers.length > 1) {
      throw new Error(`Several parsers handle column: "${column}"`);
    }

    matchingParsers[0]!.apply(column, value, draft);
  }

  let url = pathTemplate;

  for (const parameter of expectedPathParameters) {
    if (!(parameter in draft.pathParameters)) {
      throw new Error(`Missing path parameter: "${parameter}"`);
    }

    url = url.replaceAll(`<${parameter}>`, encodeURIComponent(draft.pathParameters[parameter]!));
  }

  const unresolvedParameter = url.match(/<[^>]+>/);

  if (unresolvedParameter) {
    throw new Error(`Unresolved path parameter: "${unresolvedParameter[0]}"`);
  }

  if (draft.expectedStatus === undefined) {
    throw new Error('Missing required column: "status"');
  }

  if (draft.responseFixture === undefined) {
    throw new Error('Missing required column: "response"');
  }

  const query = draft.query.toString();

  if (query !== "") {
    url += `${url.includes("?") ? "&" : "?"}${query}`;
  }

  return {
    state: draft.state,

    request: {
      method,
      url,
      headers: draft.headers,
      ...(draft.payload !== undefined && {
        payload: draft.payload
      })
    },

    expectedStatus: draft.expectedStatus,
    responseFixture: draft.responseFixture
  };
}
