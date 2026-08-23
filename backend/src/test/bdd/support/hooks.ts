import { After } from "@cucumber/cucumber";
import type { ApiWorld } from "./world.js";

After(async function (this: ApiWorld) {
  await this.disposeCase();
});
