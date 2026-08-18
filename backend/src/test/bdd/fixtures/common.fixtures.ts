import { createDefaultDatabaseState, TEST_USER_IDS } from "@/test/bdd/data/database.data.js";
import { loadDefaultTmdbData } from "@/test/bdd/data/tmdb.data.js";
import { createEmptyDatabaseState } from "@/test/bdd/doubles/prisma.double.js";
import { defineApiState } from "./registry.js";

defineApiState("default.authenticated", ({ identity, prisma, tmdb }) => {
  identity.userId = TEST_USER_IDS.primary;

  prisma.load(createDefaultDatabaseState());
  loadDefaultTmdbData(tmdb);
});

defineApiState("default.other-user", ({ identity, prisma, tmdb }) => {
  identity.userId = TEST_USER_IDS.other;

  prisma.load(createDefaultDatabaseState());
  loadDefaultTmdbData(tmdb);
});

defineApiState("default.anonymous", ({ prisma, tmdb }) => {
  prisma.load(createDefaultDatabaseState());
  loadDefaultTmdbData(tmdb);
});

defineApiState("default.worker", ({ identity, prisma, tmdb }) => {
  identity.isWorker = true;

  prisma.load(createDefaultDatabaseState());
  loadDefaultTmdbData(tmdb);
});

defineApiState("empty.authenticated", ({ identity, prisma, tmdb }) => {
  identity.userId = TEST_USER_IDS.primary;

  prisma.load(createEmptyDatabaseState());
  loadDefaultTmdbData(tmdb);
});
