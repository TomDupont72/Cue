import { createDefaultDatabaseState, TEST_USER_IDS } from "@/test/bdd/data/database.data.js";
import { loadDefaultTmdbData } from "@/test/bdd/data/tmdb.data.js";
import { createEmptyDatabaseState } from "@/test/bdd/support/test-database.js";
import { defineApiState } from "./registry.js";

defineApiState("default.authenticated", ({ identity, database, tmdb }) => {
  identity.userId = TEST_USER_IDS.primary;

  database.load(createDefaultDatabaseState());
  loadDefaultTmdbData(tmdb);
});

defineApiState("default.other-user", ({ identity, database, tmdb }) => {
  identity.userId = TEST_USER_IDS.other;

  database.load(createDefaultDatabaseState());
  loadDefaultTmdbData(tmdb);
});

defineApiState("default.anonymous", ({ database, tmdb }) => {
  database.load(createDefaultDatabaseState());
  loadDefaultTmdbData(tmdb);
});

defineApiState("default.worker", ({ identity, database, tmdb }) => {
  identity.isWorker = true;

  database.load(createDefaultDatabaseState());
  loadDefaultTmdbData(tmdb);
});

defineApiState("empty.authenticated", ({ identity, database, tmdb }) => {
  identity.userId = TEST_USER_IDS.primary;

  database.load(createEmptyDatabaseState());
  loadDefaultTmdbData(tmdb);
});
