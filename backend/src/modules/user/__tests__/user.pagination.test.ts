import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decodeUserSeriesCursor,
  encodeUserSeriesCursor,
  userSeriesCursorTokenSchema
} from "../user.pagination.js";

const LAST_WATCHED_AT = new Date("2026-08-08T15:30:00.000Z");

function encodePayload(payload: unknown): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

describe("UserSeries pagination cursor", () => {
  it("round-trips a watched series cursor as a canonical URL-safe token", () => {
    const token = encodeUserSeriesCursor({
      lastWatchedAt: LAST_WATCHED_AT,
      seriesId: 42
    });

    assert.match(token, /^[A-Za-z0-9_-]+$/);
    assert.equal(userSeriesCursorTokenSchema.safeParse(token).success, true);
    assert.deepEqual(decodeUserSeriesCursor(token), {
      lastWatchedAt: LAST_WATCHED_AT,
      seriesId: 42
    });
  });

  it("round-trips a cursor whose lastWatchedAt is null", () => {
    const token = encodeUserSeriesCursor({
      lastWatchedAt: null,
      seriesId: 21
    });

    assert.deepEqual(decodeUserSeriesCursor(token), {
      lastWatchedAt: null,
      seriesId: 21
    });
  });

  it("rejects malformed, non-canonical and unsupported cursor payloads", () => {
    const validToken = encodeUserSeriesCursor({
      lastWatchedAt: LAST_WATCHED_AT,
      seriesId: 42
    });
    const invalidTokens = [
      "",
      "not-a-cursor",
      `${validToken}=`,
      "a".repeat(513),
      encodePayload({
        version: 2,
        lastWatchedAt: LAST_WATCHED_AT.toISOString(),
        seriesId: 42
      }),
      encodePayload({
        version: 1,
        lastWatchedAt: "2026-08-08T15:30:00Z",
        seriesId: 42
      }),
      encodePayload({
        version: 1,
        lastWatchedAt: LAST_WATCHED_AT.toISOString(),
        seriesId: 0
      }),
      encodePayload({
        version: 1,
        lastWatchedAt: LAST_WATCHED_AT.toISOString(),
        seriesId: 42,
        extra: true
      })
    ];

    for (const token of invalidTokens) {
      assert.equal(userSeriesCursorTokenSchema.safeParse(token).success, false, token);
      assert.throws(() => decodeUserSeriesCursor(token), {
        name: "TypeError",
        message: "Invalid pagination cursor"
      });
    }
  });

  it("rejects invalid values when encoding a cursor", () => {
    assert.throws(() =>
      encodeUserSeriesCursor({
        lastWatchedAt: null,
        seriesId: 0
      })
    );
  });
});
