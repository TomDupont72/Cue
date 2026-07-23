import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createManyAndFetch, deleteManyAndFetch } from "../prisma.js";

describe("createManyAndFetch", () => {
  it("removes unknown fields, deduplicates input and fetches created records", async () => {
    type Input = { tmdbId: number; name: string };
    type Result = Input & { id: number };

    const createManyCalls: unknown[] = [];
    const findManyCalls: unknown[] = [];
    const stored: Result[] = [{ id: 1, tmdbId: 10, name: "Stan Smith" }];
    const delegate = {
      async createMany(args: unknown) {
        createManyCalls.push(args);
      },
      async findMany(args: unknown) {
        findManyCalls.push(args);
        return stored;
      }
    };

    const result = await createManyAndFetch({
      data: [
        { tmdbId: 10, name: "Stan", character: "Agent" },
        { tmdbId: 10, name: "Stan Smith", character: "Dad" }
      ],
      scalarFields: { tmdbId: "tmdbId", name: "name" } as const,
      uniqueBy: "tmdbId",
      delegate
    });

    assert.deepEqual(createManyCalls, [
      {
        data: [{ tmdbId: 10, name: "Stan Smith" }],
        skipDuplicates: true
      }
    ]);
    assert.deepEqual(findManyCalls, [{ where: { tmdbId: { in: [10] } } }]);
    assert.equal(result, stored);
  });

  it("builds an OR filter for a compound unique key", async () => {
    let receivedWhere: unknown;
    const delegate = {
      async createMany() {},
      async findMany({ where }: { where: unknown }) {
        receivedWhere = where;
        return [];
      }
    };

    await createManyAndFetch({
      data: [
        { seriesId: 1, tmdbId: 5, name: "Season 5" },
        { seriesId: 2, tmdbId: 5, name: "Another season 5" }
      ],
      scalarFields: {
        seriesId: "seriesId",
        tmdbId: "tmdbId",
        name: "name"
      } as const,
      uniqueBy: ["seriesId", "tmdbId"] as const,
      delegate
    });

    assert.deepEqual(receivedWhere, {
      OR: [
        { seriesId: 1, tmdbId: 5 },
        { seriesId: 2, tmdbId: 5 }
      ]
    });
  });

  it("does not query Prisma when data is empty", async () => {
    let calls = 0;
    const delegate = {
      async createMany() {
        calls += 1;
      },
      async findMany() {
        calls += 1;
        return [];
      }
    };

    const result = await createManyAndFetch({
      data: [] as { tmdbId: number }[],
      scalarFields: { tmdbId: "tmdbId" } as const,
      uniqueBy: "tmdbId",
      delegate
    });

    assert.deepEqual(result, []);
    assert.equal(calls, 0);
  });
});

describe("deleteManyAndFetch", () => {
  it("fetches matching records before deleting them and returns them", async () => {
    type Result = { id: number; userId: string };

    const calls: unknown[] = [];
    const stored: Result[] = [
      { id: 1, userId: "user-1" },
      { id: 2, userId: "user-1" }
    ];
    const delegate = {
      async findMany(args: unknown) {
        calls.push(["findMany", args]);
        return stored;
      },
      async deleteMany(args: unknown) {
        calls.push(["deleteMany", args]);
      }
    };

    const result = await deleteManyAndFetch({
      where: { userId: "user-1" },
      delegate
    });

    assert.deepEqual(calls, [
      ["findMany", { where: { userId: "user-1" } }],
      ["deleteMany", { where: { userId: "user-1" } }]
    ]);
    assert.equal(result, stored);
  });

  it("does not delete when no record matches", async () => {
    let deleteManyCalls = 0;
    const delegate = {
      async findMany() {
        return [];
      },
      async deleteMany() {
        deleteManyCalls += 1;
      }
    };

    const result = await deleteManyAndFetch({
      where: { id: { in: [] as number[] } },
      delegate
    });

    assert.deepEqual(result, []);
    assert.equal(deleteManyCalls, 0);
  });
});
