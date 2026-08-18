import type { PrismaDouble } from "@/test/bdd/doubles/prisma.double.js";
import type { TmdbDouble } from "@/test/bdd/doubles/tmdb.double.js";
import type { TestIdentity } from "@/test/bdd/support/test-guards.js";

export type ApiCaseContext = {
  identity: TestIdentity;
  prisma: PrismaDouble;
  tmdb: TmdbDouble;
};

export type ExpectedResponse = {
  mode: "exact" | "partial";
  value: unknown;
};

export type ApiStateInstaller = (context: ApiCaseContext) => void | Promise<void>;

const states = new Map<string, ApiStateInstaller>();
const responses = new Map<string, ExpectedResponse>();

export function defineApiState(name: string, installer: ApiStateInstaller) {
  if (states.has(name)) {
    throw new Error(`Duplicate API state: "${name}"`);
  }

  states.set(name, installer);
}

export function defineResponse(name: string, response: ExpectedResponse) {
  if (responses.has(name)) {
    throw new Error(`Duplicate response fixture: "${name}"`);
  }

  responses.set(name, response);
}

export function resolveApiState(name: string) {
  const state = states.get(name);

  if (!state) {
    throw new Error(`Unknown API state: "${name}"`);
  }

  return state;
}

export function resolveResponse(name: string) {
  const response = responses.get(name);

  if (!response) {
    throw new Error(`Unknown response fixture: "${name}"`);
  }

  return response;
}

export function exact(value: unknown): ExpectedResponse {
  return { mode: "exact", value };
}

export function partial(value: unknown): ExpectedResponse {
  return { mode: "partial", value };
}
