import { After, AfterAll } from "@cucumber/cucumber";
import { disconnectTestDatabase } from "./test-database.js";
import type { ApiWorld } from "./world.js";

After(async function (this: ApiWorld) {
  await this.disposeCase();
});

AfterAll(async () => {
  await disconnectTestDatabase();
});
