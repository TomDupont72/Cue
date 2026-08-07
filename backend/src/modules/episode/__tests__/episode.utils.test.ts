import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getEpisodeReleaseCutoff } from "../episode.utils.js";

describe("getEpisodeReleaseCutoff", { concurrency: false }, () => {
  it("returns the start of the following UTC day", () => {
    const cutoff = getEpisodeReleaseCutoff(new Date("2026-08-08T23:59:59.999Z"));

    assert.equal(cutoff.toISOString(), "2026-08-09T00:00:00.000Z");
  });

  it("handles UTC month and year boundaries", () => {
    const cutoff = getEpisodeReleaseCutoff(new Date("2026-12-31T12:00:00.000Z"));

    assert.equal(cutoff.toISOString(), "2027-01-01T00:00:00.000Z");
  });
});
