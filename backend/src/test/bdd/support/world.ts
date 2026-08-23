import { World, setWorldConstructor } from "@cucumber/cucumber";
import type { InjectOptions, LightMyRequestResponse } from "fastify";
import { PatchScope } from "@/test/bdd/support/patch-scope.js";
import { PrismaDouble } from "@/test/bdd/doubles/prisma.double.js";
import { TmdbDouble } from "@/test/bdd/doubles/tmdb.double.js";
import { createTestGuards, TestIdentity } from "@/test/bdd/support/test-guards.js";
import { resolveApiState } from "@/test/bdd/fixtures/registry.js";
import { buildApp, type AppInstance } from "@/app.js";

export class ApiWorld extends World {
  private selectedState?: string;

  app?: AppInstance;
  response?: LightMyRequestResponse;
  scope?: PatchScope;

  useState(name: string) {
    this.selectedState = name;
  }

  async prepareCase(stateOverride?: string) {
    await this.disposeCase();

    const stateName = stateOverride ?? this.selectedState;

    if (!stateName) {
      throw new Error("No API state selected");
    }

    const scope = new PatchScope();
    const prisma = new PrismaDouble();
    const tmdb = new TmdbDouble();

    const identity: TestIdentity = {
      userId: null,
      isWorker: false
    };

    this.scope = scope;

    try {
      await resolveApiState(stateName)({
        identity,
        prisma,
        tmdb
      });

      prisma.install(scope);
      tmdb.install(scope);

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
    }
  }
}

setWorldConstructor(ApiWorld);
