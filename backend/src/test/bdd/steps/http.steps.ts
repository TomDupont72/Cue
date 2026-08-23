import { Given, Then, When, type DataTable } from "@cucumber/cucumber";
import {
  assertResponseArrayAtPath,
  assertResponseBodyExact,
  assertResponseBodyPartial,
  assertResponseEmptyArrayAtPath,
  assertResponseFields,
  assertResponseNullAtPath,
  assertResponseObjectAtPath,
  assertResponseStatus
} from "@/test/bdd/http/http-response.assertions.js";
import type { ApiWorld } from "@/test/bdd/support/world.js";

const HTTP_METHODS = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

function parseHttpMethod(value: string): HttpMethod {
  const method = value.toUpperCase();

  if (!HTTP_METHODS.includes(method as (typeof HTTP_METHODS)[number])) {
    throw new Error(`Unsupported HTTP method: "${value}"`);
  }

  return method as HttpMethod;
}

Given("the API state is {string}", function (this: ApiWorld, stateName: string) {
  this.useState(stateName);
});

When(
  "I send a {word} request to {string}",
  async function (this: ApiWorld, method: string, url: string) {
    await this.sendRequest({
      method: parseHttpMethod(method),
      url
    });
  }
);

Then("the response status should be {int}", function (this: ApiWorld, status: number) {
  assertResponseStatus(this.getResponse(), status);
});

Then(
  "the response body should have exactly these fields:",
  function (this: ApiWorld, table: DataTable) {
    assertResponseFields(this.getResponse(), table.raw());
  }
);

Then("the response body should exactly match:", function (this: ApiWorld, table: DataTable) {
  assertResponseBodyExact(this.getResponse(), table.raw());
});

Then("the response body should partially match:", function (this: ApiWorld, table: DataTable) {
  assertResponseBodyPartial(this.getResponse(), table.raw());
});

Then(
  "the response object at {string} should exactly match:",
  function (this: ApiWorld, path: string, table: DataTable) {
    assertResponseObjectAtPath(this.getResponse(), path, table.raw());
  }
);

Then(
  "the response array at {string} should exactly match:",
  function (this: ApiWorld, path: string, table: DataTable) {
    assertResponseArrayAtPath(this.getResponse(), path, table.raw());
  }
);

Then("the response field at {string} should be null", function (this: ApiWorld, path: string) {
  assertResponseNullAtPath(this.getResponse(), path);
});

Then("the response array at {string} should be empty", function (this: ApiWorld, path: string) {
  assertResponseEmptyArrayAtPath(this.getResponse(), path);
});
