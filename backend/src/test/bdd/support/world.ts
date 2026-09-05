import { World, setWorldConstructor } from "@cucumber/cucumber";
import type { InjectOptions, LightMyRequestResponse } from "fastify";
import { PatchScope } from "@/test/bdd/support/patch-scope.js";
import { TmdbDouble } from "@/test/bdd/doubles/tmdb.double.js";
import { createTestGuards, TestIdentity } from "@/test/bdd/support/test-guards.js";
import { TestDatabase } from "@/test/bdd/support/test-database.js";
import type { DatabaseFixtureCollection } from "@/test/bdd/data/database/database-fixture.schemas.js";
import { buildApp, type AppInstance } from "@/app.js";

export class ApiWorld extends World {
  private authenticatedUserId?: string | null;
  private pendingDatabaseFixtures: Array<{
    collection: DatabaseFixtureCollection;
    rows: Record<string, string>[];
  }> = [];
  private database?: TestDatabase;

  app?: AppInstance;
  response?: LightMyRequestResponse;
  scope?: PatchScope;

  authenticateAs(userId: string | null) {
    this.authenticatedUserId = userId;
  }

  addDatabaseFixtures(collection: DatabaseFixtureCollection, rows: Record<string, string>[]) {
    this.pendingDatabaseFixtures.push({ collection, rows });
  }

  getDatabaseFixture(reference: string) {
    if (!this.database) {
      throw new Error("The test database has not been prepared yet");
    }

    return this.database.getFixture(reference);
  }

  async prepareCase() {
    await this.disposeCase();

    const scope = new PatchScope();
    const database = new TestDatabase();
    const tmdb = new TmdbDouble();

    const identity: TestIdentity = {
      userId: null,
      isWorker: false
    };

    this.scope = scope;

    try {
      if (this.authenticatedUserId !== undefined) {
        identity.userId = this.authenticatedUserId;
      }

      for (const fixtures of this.pendingDatabaseFixtures) {
        database.addFixtures(fixtures.collection, fixtures.rows);
      }

      await database.resetAndSeed(identity.userId);
      tmdb.install(scope);

      this.database = database;

      this.app = await buildApp({
        loggerEnabled: false,
        docs: false,
        guardPlugins: [createTestGuards(identity)]
      });
    } catch (error) {
      await this.disposeCase();
      throw error;
    }
  }

  async sendRequest(options: InjectOptions) {
    if (!this.app) {
      await this.prepareCase();
    }

    if (!this.app) {
      throw new Error("HTTP application was not prepared");
    }

    this.response = await this.app.inject(options);
  }

  getResponse() {
    if (!this.response) {
      throw new Error("No HTTP response is available; send a request first");
    }

    return this.response;
  }

  async disposeCase() {
    try {
      await this.app?.close();
    } finally {
      this.app = undefined;
      this.response = undefined;

      this.scope?.restore();
      this.scope = undefined;
      this.database = undefined;
    }
  }
}

setWorldConstructor(ApiWorld);
