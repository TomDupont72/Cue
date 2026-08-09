export type UnauthorizedRecoveryResult =
  "session-active" | "session-expired" | "session-check-failed" | "session-check-stale";

type SessionCheckResult = {
  data: object | null;
  error: unknown | null;
};

export type UnauthorizedRecoveryDependencies = {
  getSession: () => Promise<SessionCheckResult>;
  getSessionGeneration: () => number;
  isCurrentSessionGeneration: (generation: number) => boolean;
  invalidateSession: () => void;
  cancelQueries: () => Promise<void>;
  clearQueryClient: () => void;
  expireSession: () => void;
};

async function ignoreFailure(action: () => void | Promise<void>): Promise<void> {
  try {
    await action();
  } catch {
    // Session recovery must never replace the original API error.
  }
}

export function createUnauthorizedRecovery({
  getSession,
  getSessionGeneration,
  isCurrentSessionGeneration,
  invalidateSession,
  cancelQueries,
  clearQueryClient,
  expireSession
}: UnauthorizedRecoveryDependencies): () => Promise<UnauthorizedRecoveryResult> {
  let pendingRecovery: {
    generation: number;
    promise: Promise<UnauthorizedRecoveryResult>;
  } | null = null;

  async function recover(generation: number): Promise<UnauthorizedRecoveryResult> {
    let result: SessionCheckResult;

    try {
      result = await getSession();
    } catch {
      return "session-check-failed";
    }

    if (!isCurrentSessionGeneration(generation)) {
      return "session-check-stale";
    }

    if (result.error !== null) {
      return "session-check-failed";
    }

    if (result.data !== null) {
      return "session-active";
    }

    try {
      invalidateSession();
    } catch {
      // The confirmed session status still belongs to the original API error.
    }

    const cleanupGeneration = getSessionGeneration();

    await ignoreFailure(cancelQueries);

    if (!isCurrentSessionGeneration(cleanupGeneration)) {
      return "session-check-stale";
    }

    await ignoreFailure(clearQueryClient);

    if (!isCurrentSessionGeneration(cleanupGeneration)) {
      return "session-check-stale";
    }

    await ignoreFailure(expireSession);

    return "session-expired";
  }

  return function handleUnauthorized(): Promise<UnauthorizedRecoveryResult> {
    const generation = getSessionGeneration();

    if (pendingRecovery?.generation === generation) {
      return pendingRecovery.promise;
    }

    const promise = recover(generation)
      .catch(() => "session-check-failed" as const)
      .finally(() => {
        if (pendingRecovery?.promise === promise) {
          pendingRecovery = null;
        }
      });

    pendingRecovery = { generation, promise };

    return promise;
  };
}
