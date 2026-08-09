import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createUnauthorizedRecovery,
  type UnauthorizedRecoveryDependencies
} from "../src/lib/unauthorizedRecovery.ts";
import {
  getSessionGeneration,
  invalidateSessionGeneration,
  isCurrentSessionGeneration
} from "../src/lib/sessionGeneration.ts";

function createDependencies(
  overrides: Partial<UnauthorizedRecoveryDependencies> = {}
): UnauthorizedRecoveryDependencies {
  return {
    getSession: async () => ({ data: {}, error: null }),
    getSessionGeneration: () => 0,
    isCurrentSessionGeneration: (generation) => generation === 0,
    invalidateSession: () => undefined,
    cancelQueries: async () => undefined,
    clearQueryClient: () => undefined,
    expireSession: () => undefined,
    ...overrides
  };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;

  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

describe("createUnauthorizedRecovery", () => {
  it("purges the cache and expires the local session when the session is expired", async () => {
    const calls: string[] = [];
    const handleUnauthorized = createUnauthorizedRecovery(
      createDependencies({
        getSession: async () => {
          calls.push("get-session");
          return { data: null, error: null };
        },
        invalidateSession: () => {
          calls.push("invalidate-session");
        },
        cancelQueries: async () => {
          calls.push("cancel-queries");
        },
        clearQueryClient: () => {
          calls.push("clear-query-client");
        },
        expireSession: () => {
          calls.push("expire-session");
        }
      })
    );

    const result = await handleUnauthorized();

    assert.equal(result, "session-expired");
    assert.deepEqual(calls, [
      "get-session",
      "invalidate-session",
      "cancel-queries",
      "clear-query-client",
      "expire-session"
    ]);
  });

  it("does not purge the cache when the session is active", async () => {
    let purgeCount = 0;
    const handleUnauthorized = createUnauthorizedRecovery(
      createDependencies({
        clearQueryClient: () => {
          purgeCount += 1;
        }
      })
    );

    assert.equal(await handleUnauthorized(), "session-active");
    assert.equal(purgeCount, 0);
  });

  it("does not purge the cache when the session endpoint returns an error", async () => {
    let purgeCount = 0;
    const handleUnauthorized = createUnauthorizedRecovery(
      createDependencies({
        getSession: async () => ({ data: null, error: new Error("Unavailable") }),
        clearQueryClient: () => {
          purgeCount += 1;
        }
      })
    );

    assert.equal(await handleUnauthorized(), "session-check-failed");
    assert.equal(purgeCount, 0);
  });

  it("never rejects when the session check throws", async () => {
    const handleUnauthorized = createUnauthorizedRecovery(
      createDependencies({
        getSession: async () => {
          throw new Error("Network failure");
        }
      })
    );

    await assert.doesNotReject(handleUnauthorized());
    assert.equal(await handleUnauthorized(), "session-check-failed");
  });

  it("shares one session check between simultaneous unauthorized responses", async () => {
    const sessionResult = createDeferred<{ data: object | null; error: unknown | null }>();
    let sessionCheckCount = 0;
    let invalidationCount = 0;
    let purgeCount = 0;
    const handleUnauthorized = createUnauthorizedRecovery(
      createDependencies({
        getSession: () => {
          sessionCheckCount += 1;
          return sessionResult.promise;
        },
        invalidateSession: () => {
          invalidationCount += 1;
        },
        clearQueryClient: () => {
          purgeCount += 1;
        }
      })
    );

    const firstRecovery = handleUnauthorized();
    const secondRecovery = handleUnauthorized();
    const thirdRecovery = handleUnauthorized();

    assert.equal(firstRecovery, secondRecovery);
    assert.equal(secondRecovery, thirdRecovery);
    assert.equal(sessionCheckCount, 1);

    sessionResult.resolve({ data: null, error: null });

    assert.deepEqual(await Promise.all([firstRecovery, secondRecovery, thirdRecovery]), [
      "session-expired",
      "session-expired",
      "session-expired"
    ]);
    assert.equal(invalidationCount, 1);
    assert.equal(purgeCount, 1);
  });

  it("does not share or apply a session check after the session generation changes", async () => {
    const firstSessionResult = createDeferred<{ data: object | null; error: unknown | null }>();
    const secondSessionResult = createDeferred<{ data: object | null; error: unknown | null }>();
    let generation = 0;
    let sessionCheckCount = 0;
    let cleanupCount = 0;
    const handleUnauthorized = createUnauthorizedRecovery(
      createDependencies({
        getSession: () => {
          sessionCheckCount += 1;
          return sessionCheckCount === 1 ? firstSessionResult.promise : secondSessionResult.promise;
        },
        getSessionGeneration: () => generation,
        isCurrentSessionGeneration: (capturedGeneration) => capturedGeneration === generation,
        invalidateSession: () => {
          cleanupCount += 1;
        },
        clearQueryClient: () => {
          cleanupCount += 1;
        }
      })
    );

    const firstRecovery = handleUnauthorized();

    generation += 1;

    const secondRecovery = handleUnauthorized();

    assert.notEqual(firstRecovery, secondRecovery);
    assert.equal(sessionCheckCount, 2);

    firstSessionResult.resolve({ data: null, error: null });
    secondSessionResult.resolve({ data: {}, error: null });

    assert.equal(await firstRecovery, "session-check-stale");
    assert.equal(await secondRecovery, "session-active");
    assert.equal(cleanupCount, 0);
  });

  it("does not clear or expire a new session established while queries are being cancelled", async () => {
    const cancellationStarted = createDeferred<void>();
    const cancellationResult = createDeferred<void>();
    let generation = 0;
    let clearCount = 0;
    let expireCount = 0;
    const handleUnauthorized = createUnauthorizedRecovery(
      createDependencies({
        getSession: async () => ({ data: null, error: null }),
        getSessionGeneration: () => generation,
        isCurrentSessionGeneration: (capturedGeneration) => capturedGeneration === generation,
        invalidateSession: () => {
          generation += 1;
        },
        cancelQueries: () => {
          cancellationStarted.resolve();
          return cancellationResult.promise;
        },
        clearQueryClient: () => {
          clearCount += 1;
        },
        expireSession: () => {
          expireCount += 1;
        }
      })
    );

    const recovery = handleUnauthorized();

    await cancellationStarted.promise;
    generation += 1;
    cancellationResult.resolve();

    assert.equal(await recovery, "session-check-stale");
    assert.equal(clearCount, 0);
    assert.equal(expireCount, 0);
  });

  it("allows a new session check after the single flight has settled", async () => {
    let sessionCheckCount = 0;
    const handleUnauthorized = createUnauthorizedRecovery(
      createDependencies({
        getSession: async () => {
          sessionCheckCount += 1;
          return { data: {}, error: null };
        }
      })
    );

    await handleUnauthorized();
    await handleUnauthorized();

    assert.equal(sessionCheckCount, 2);
  });

  it("keeps the confirmed expired status when cleanup actions fail", async () => {
    const handleUnauthorized = createUnauthorizedRecovery(
      createDependencies({
        getSession: async () => ({ data: null, error: null }),
        invalidateSession: () => {
          throw new Error("Session invalidation failed");
        },
        cancelQueries: async () => {
          throw new Error("Cancellation failed");
        },
        clearQueryClient: () => {
          throw new Error("Clear failed");
        },
        expireSession: () => {
          throw new Error("Session update failed");
        }
      })
    );

    assert.equal(await handleUnauthorized(), "session-expired");
  });
});

describe("session generation", () => {
  it("invalidates callbacks captured by a previous session", () => {
    const previousGeneration = getSessionGeneration();

    assert.equal(isCurrentSessionGeneration(previousGeneration), true);

    invalidateSessionGeneration();

    assert.equal(isCurrentSessionGeneration(previousGeneration), false);
    assert.equal(isCurrentSessionGeneration(getSessionGeneration()), true);
  });
});
