import { loadDatabaseFixtures } from "./database/database-fixture.parser.js";

export const TEST_USER_IDS = {
  primary: "user-1",
  other: "user-2"
} as const;

export const TEST_TMDB_IDS = {
  onePiece: 37854,
  naruto: 46260
} as const;

const defaultState = loadDatabaseFixtures("default").state;

export function createDefaultDatabaseState() {
  return structuredClone(defaultState);
}
