import { Given, Then, type DataTable } from "@cucumber/cucumber";
import { runHttpContract } from "@/test/bdd/http/http-case.runner.js";
import type { ApiWorld } from "@/test/bdd/support/world.js";

Given("the API state is {string}", function (this: ApiWorld, stateName: string) {
  this.useState(stateName);
});

Then(
  "{word} {string} should satisfy:",
  async function (this: ApiWorld, method: string, pathTemplate: string, table: DataTable) {
    await runHttpContract(this, method, pathTemplate, table.hashes());
  }
);
