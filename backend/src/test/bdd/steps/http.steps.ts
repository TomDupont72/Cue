import { Given, Then, When, type DataTable } from "@cucumber/cucumber";
import {
  assertResponseArrayAtPath,
  assertResponseArrayMatchesFixtures,
  assertResponseBodyExact,
  assertResponseBodyMatchesFixture,
  assertResponseEmptyArrayAtPath,
  assertResponseFields,
  assertResponseNullAtPath,
  assertResponseObjectAtPath,
  assertResponseObjectMatchesFixture,
  assertResponseStatus,
  buildExpectedFixtures,
  buildExpectedUserEpisodePostResponse,
  parseObjectTable
} from "@/test/bdd/http/http-response.assertions.js";
import type { ApiWorld } from "@/test/bdd/support/world.js";
import type { DatabaseFixtureCollection } from "@/test/bdd/data/database/database-fixture.schemas.js";
import { z } from "zod";

const HTTP_METHODS = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

const DATABASE_COLLECTIONS = {
  series: "series",
  seasons: "seasons",
  episodes: "episodes",
  "user series": "userSeries",
  "user episodes": "userEpisodes"
} as const satisfies Record<string, DatabaseFixtureCollection>;

type DatabaseCollectionLabel = keyof typeof DATABASE_COLLECTIONS;

const currentDateSchema = z.iso.datetime().transform((value) => new Date(value));

function parseHttpMethod(value: string): HttpMethod {
  const method = value.toUpperCase();

  if (!HTTP_METHODS.includes(method as (typeof HTTP_METHODS)[number])) {
    throw new Error(`Unsupported HTTP method: "${value}"`);
  }

  return method as HttpMethod;
}

Given("authentication as {string}", function (this: ApiWorld, userId: string) {
  this.authenticateAs(userId);
});

Given("the current date {string}", function (this: ApiWorld, value: string) {
  this.setCurrentDate(currentDateSchema.parse(value));
});

Given(
  /^the database with these (series|seasons|episodes|user series|user episodes):$/,
  function (this: ApiWorld, label: DatabaseCollectionLabel, table: DataTable) {
    this.addDatabaseFixtures(DATABASE_COLLECTIONS[label], table.hashes());
  }
);

When(
  "I send a {word} request to {string}",
  async function (this: ApiWorld, method: string, url: string) {
    await this.sendRequest({
      method: parseHttpMethod(method),
      url
    });
  }
);

When(
  "I send a {word} request to {string} with body:",
  async function (this: ApiWorld, method: string, url: string, table: DataTable) {
    await this.sendRequest({
      method: parseHttpMethod(method),
      url,
      payload: parseObjectTable(table.raw())
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

Then(
  "the response body should exactly match this fixture:",
  function (this: ApiWorld, table: DataTable) {
    const fixtures = buildExpectedFixtures(table.raw(), (reference) =>
      this.getDatabaseFixture(reference)
    );

    if (fixtures.length !== 1) {
      throw new Error("The response fixture table must contain exactly one data row");
    }

    assertResponseBodyMatchesFixture(this.getResponse(), fixtures[0]);
  }
);

Then(
  "the response body should exactly match this user episode response:",
  function (this: ApiWorld, table: DataTable) {
    const expected = buildExpectedUserEpisodePostResponse(table.raw(), (reference) =>
      this.getDatabaseFixture(reference)
    );

    assertResponseBodyMatchesFixture(this.getResponse(), expected);
  }
);

Then(
  "the database should contain exactly these user series:",
  async function (this: ApiWorld, table: DataTable) {
    await this.assertExactlyUserSeries(table.hashes());
  }
);

Then(
  /^the database should have (?:exactly )?these (series|seasons|episodes|user series|user episodes) added:$/,
  async function (this: ApiWorld, label: DatabaseCollectionLabel, table: DataTable) {
    await this.assertAddedDatabaseRows(DATABASE_COLLECTIONS[label], table.hashes());
  }
);

Then(
  /^the database should have these (series|seasons|episodes|user series|user episodes) deleted:$/,
  async function (this: ApiWorld, label: DatabaseCollectionLabel, table: DataTable) {
    await this.assertDeletedDatabaseRows(DATABASE_COLLECTIONS[label], table.hashes());
  }
);

Then(
  /^the database should have these (series|seasons|episodes|user series|user episodes) fields updated:$/,
  async function (this: ApiWorld, label: DatabaseCollectionLabel, table: DataTable) {
    await this.assertUpdatedDatabaseFields(DATABASE_COLLECTIONS[label], table.hashes());
  }
);

Then(
  "the database should contain exactly these user episodes:",
  async function (this: ApiWorld, table: DataTable) {
    await this.assertExactlyUserEpisodes(table.hashes());
  }
);

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

Then(
  "the response object at {string} should exactly match the fixture {string}",
  function (this: ApiWorld, path: string, reference: string) {
    assertResponseObjectMatchesFixture(
      this.getResponse(),
      path,
      this.getDatabaseFixture(reference)
    );
  }
);

Then(
  "the response array at {string} should exactly match these fixtures:",
  function (this: ApiWorld, path: string, table: DataTable) {
    assertResponseArrayMatchesFixtures(
      this.getResponse(),
      path,
      buildExpectedFixtures(table.raw(), (reference) => this.getDatabaseFixture(reference))
    );
  }
);

Then("the response field at {string} should be null", function (this: ApiWorld, path: string) {
  assertResponseNullAtPath(this.getResponse(), path);
});

Then("the response array at {string} should be empty", function (this: ApiWorld, path: string) {
  assertResponseEmptyArrayAtPath(this.getResponse(), path);
});
