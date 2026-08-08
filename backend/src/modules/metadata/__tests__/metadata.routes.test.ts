import { mockTmdbFetch } from "@/test/mocks/tmdb.mock.js";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from "fastify-type-provider-zod";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { metadataRoutes } from "../metadata.routes.js";

async function buildApp() {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("requireAuth", async (request) => {
    request.user = { id: "test-user" };
  });
  app.decorate("requireWorker", async () => {});

  await app.register(metadataRoutes, { prefix: "/api/metadata" });
  await app.ready();

  return app;
}

describe("GET /api/metadata/series/search", () => {
  it("returns parsed One Piece results from TMDB", async (t) => {
    const fetchMock = mockTmdbFetch(t);
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "GET",
      url: "/api/metadata/series/search?query=one%20piece&page=1"
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().results.length, 2);
    assert.equal(response.json().results[0].tmdbId, 37854);
    assert.equal(response.json().results[0].originalName, "ワンピース");
    assert.equal(fetchMock.mock.callCount(), 1);

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.arguments[0]));
    assert.equal(requestedUrl.pathname, "/3/search/tv");
    assert.equal(requestedUrl.searchParams.get("query"), "one piece");
    assert.equal(requestedUrl.searchParams.get("page"), "1");
    assert.equal(requestedUrl.searchParams.get("language"), "fr-FR");
  });

  it("rejects a query shorter than two characters without calling TMDB", async (t) => {
    const fetchMock = mockTmdbFetch(t);
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "GET",
      url: "/api/metadata/series/search?query=o"
    });

    assert.equal(response.statusCode, 400);
    assert.equal(fetchMock.mock.callCount(), 0);
  });
});

describe("GET /api/metadata/series/changes", () => {
  it("returns a Cue response with camelCase TMDB identifiers", async (t) => {
    const fetchMock = mockTmdbFetch(t);
    const app = await buildApp();
    t.after(() => app.close());

    const response = await app.inject({
      method: "GET",
      url: "/api/metadata/series/changes?startDate=2026-01-01&endDate=2026-01-14&page=1"
    });

    assert.equal(response.statusCode, 200, response.body);
    assert.deepEqual(response.json(), {
      results: [{ tmdbId: 37854 }, { tmdbId: 111110 }],
      page: 1,
      totalPages: 1,
      totalResults: 2
    });
    assert.equal(fetchMock.mock.callCount(), 1);

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.arguments[0]));
    assert.equal(requestedUrl.pathname, "/3/tv/changes");
    assert.equal(requestedUrl.searchParams.get("start_date"), "2026-01-01");
    assert.equal(requestedUrl.searchParams.get("end_date"), "2026-01-14");
    assert.equal(requestedUrl.searchParams.get("page"), "1");
  });
});
