import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  camelCaseKeys,
  dropKeys,
  excludeMissingFields,
  getMany,
  joinBy
} from "../object.js";
import { z } from "zod";

describe("object utilities", () => {
  it("drops only the requested keys without mutating the source", () => {
    const source = { id: 1, name: "Stan", extra: true };

    assert.deepEqual(dropKeys(source, ["extra"]), { id: 1, name: "Stan" });
    assert.deepEqual(source, { id: 1, name: "Stan", extra: true });
  });

  it("extracts and flattens several fields with getMany", () => {
    const seasons = [
      { episodes: [{ id: 1 }, { id: 2 }] },
      { episodes: [{ id: 3 }] }
    ];
    const series = { createdBy: [{ id: 4 }], owner: { id: 5 } };

    assert.deepEqual(
      getMany<{ id: number }>(
        { data: seasons, fields: ["episodes"] },
        { data: series, fields: ["createdBy", "owner"] }
      ),
      [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
    );
  });

  it("joins matching records and returns a selected target value", () => {
    const tmdbPeople = [{ tmdbId: 10 }, { tmdbId: 30 }];
    const people = [
      { id: 1, tmdbId: 10 },
      { id: 2, tmdbId: 20 }
    ];

    assert.deepEqual(
      joinBy(
        { data: tmdbPeople, key: "tmdbId" },
        { data: people, key: "tmdbId", value: "id" }
      ),
      [1]
    );
  });

  it("projects aliased values and flattens array values", () => {
    const guestStars = [{ tmdbId: 10, characters: ["Stan", "Roger"] }];
    const people = [{ id: 7, tmdbId: 10 }];

    assert.deepEqual(
      joinBy(
        {
          data: guestStars,
          key: "tmdbId",
          value: "characters",
          as: "name"
        },
        {
          data: people,
          key: "tmdbId",
          value: "id",
          as: "peopleId"
        }
      ),
      [
        { name: "Stan", peopleId: 7 },
        { name: "Roger", peopleId: 7 }
      ]
    );
  });

  it("flattens array results returned by a join selector", () => {
    const tmdbSeasons = [{ tmdbId: 1, episodes: [{ tmdbId: 11 }, { tmdbId: 12 }] }];
    const seasons = [{ id: 9, tmdbId: 1 }];

    assert.deepEqual(
      joinBy(
        { data: tmdbSeasons, key: "tmdbId" },
        {
          data: seasons,
          key: "tmdbId",
          select: (season, tmdbSeason) =>
            tmdbSeason.episodes.map((episode) => ({ ...episode, seasonId: season.id }))
        }
      ),
      [
        { tmdbId: 11, seasonId: 9 },
        { tmdbId: 12, seasonId: 9 }
      ]
    );
  });

  it("camel-cases nested objects and applies explicit renames", () => {
    assert.deepEqual(
      camelCaseKeys(
        { id: 1, first_air_date: "2005-02-06", nested_items: [{ profile_path: null }] },
        { id: "tmdbId" } as const
      ),
      {
        tmdbId: 1,
        firstAirDate: "2005-02-06",
        nestedItems: [{ profilePath: null }]
      }
    );
  });

  it("filters array entries missing required fields before parsing", () => {
    const schema = excludeMissingFields(
      z.object({ id: z.number(), name: z.string() }),
      ["id"]
    );

    assert.deepEqual(schema.parse([{ id: 1, name: "Stan" }, { id: null, name: "Unknown" }]), [
      { id: 1, name: "Stan" }
    ]);
  });
});
