import { After, AfterAll } from "@cucumber/cucumber";

import type { ApiWorld } from "@/test/bdd/support/world.js";

import { disconnectTestDatabase } from "@/test/bdd/support/test-database.js";

After(async function (this: ApiWorld) {
  await this.disposeCase();
});

AfterAll(async () => {
  await disconnectTestDatabase();
});
