import { World, setWorldConstructor } from "@cucumber/cucumber";
import type { InjectOptions, LightMyRequestResponse } from "fastify";
import { PatchScope } from "@/test/bdd/support/patch-scope.js";
import { TmdbDouble } from "@/test/bdd/doubles/tmdb.double.js";
import { createTestGuards, TestIdentity } from "@/test/bdd/support/test-guards.js";
import { TestDatabase } from "@/test/bdd/support/test-database.js";
import type { DatabaseFixtureCollection } from "@/test/bdd/data/database/database-fixture.schemas.js";
import { userService } from "@/modules/user/user.service.js";
import { buildApp, type AppInstance } from "@/app.js";

export class ApiWorld extends World {
  private authenticatedUserId?: string | null;
  private currentDate?: Date;
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

  setCurrentDate(currentDate: Date) {
    this.currentDate = currentDate;
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

  async assertExactlyUserSeries(rows: Record<string, string>[]) {
    if (!this.database) {
      throw new Error("The test database has not been prepared yet");
    }

    await this.database.assertExactlyUserSeries(rows);
  }

  async assertAddedDatabaseRows(
    collection: DatabaseFixtureCollection,
    rows: Record<string, string>[]
  ) {
    if (!this.database) {
      throw new Error("The test database has not been prepared yet");
    }

    await this.database.assertAddedDatabaseRows(collection, rows);
  }

  async assertUpdatedDatabaseFields(
    collection: DatabaseFixtureCollection,
    rows: Record<string, string>[]
  ) {
    if (!this.database) {
      throw new Error("The test database has not been prepared yet");
    }

    await this.database.assertUpdatedDatabaseFields(collection, rows);
  }

  async assertExactlyUserEpisodes(rows: Record<string, string>[]) {
    if (!this.database) {
      throw new Error("The test database has not been prepared yet");
    }

    await this.database.assertExactlyUserEpisodes(rows);
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
      if (this.currentDate) {
        const currentDate = new Date(this.currentDate);
        const episodeUpcomingGet = userService.episodeUpcomingGet.bind(userService);
        const episodePost = userService.episodePost.bind(userService);
        const seriesPost = userService.seriesPost.bind(userService);
        const getEpisodesAtCurrentDate: typeof userService.episodeUpcomingGet = (userId) =>
          episodeUpcomingGet(userId, currentDate);
        const postEpisodeAtCurrentDate: typeof userService.episodePost = (userId, params) =>
          episodePost(userId, params, currentDate);
        const postSeriesAtCurrentDate: typeof userService.seriesPost = (userId, params, body) =>
          seriesPost(userId, params, body, currentDate);

        scope.replace(userService, "episodeUpcomingGet", getEpisodesAtCurrentDate);
        scope.replace(userService, "episodePost", postEpisodeAtCurrentDate);
        scope.replace(userService, "seriesPost", postSeriesAtCurrentDate);
      }

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

    await this.database?.snapshotBeforeRequest();
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
