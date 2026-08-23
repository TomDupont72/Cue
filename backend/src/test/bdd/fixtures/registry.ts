import type { PrismaDouble } from "@/test/bdd/doubles/prisma.double.js";
import type { TmdbDouble } from "@/test/bdd/doubles/tmdb.double.js";
import type { TestIdentity } from "@/test/bdd/support/test-guards.js";

export type ApiCaseContext = {
  identity: TestIdentity;
  prisma: PrismaDouble;
  tmdb: TmdbDouble;
};

export type ApiStateInstaller = (context: ApiCaseContext) => void | Promise<void>;

const states = new Map<string, ApiStateInstaller>();

export function defineApiState(name: string, installer: ApiStateInstaller) {
  if (states.has(name)) {
    throw new Error(`Duplicate API state: "${name}"`);
  }

  states.set(name, installer);
}

export function resolveApiState(name: string) {
  const state = states.get(name);

  if (!state) {
    throw new Error(`Unknown API state: "${name}"`);
  }

  return state;
}
