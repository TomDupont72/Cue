import { authClient } from "@/lib/authClient";
import { queryClient } from "@/lib/queryClient";
import {
  getSessionGeneration,
  invalidateSessionGeneration,
  isCurrentSessionGeneration
} from "@/lib/sessionGeneration";
import { createUnauthorizedRecovery } from "@/lib/unauthorizedRecovery";

const SESSION_CHECK_TIMEOUT_MS = 5_000;

async function getSession() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SESSION_CHECK_TIMEOUT_MS);

  try {
    return await authClient.getSession({
      query: {
        disableCookieCache: true,
        disableRefresh: true
      },
      fetchOptions: {
        signal: controller.signal
      }
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function expireSession(): void {
  const sessionAtom = authClient.$store.atoms.session;
  const currentSession = sessionAtom.get();

  // The imperative getSession call does not update Better Auth's React session store.
  sessionAtom.set({
    ...currentSession,
    data: null,
    error: null,
    isPending: false,
    isRefetching: false
  });
}

export const handleUnauthorizedResponse = createUnauthorizedRecovery({
  getSession,
  getSessionGeneration,
  isCurrentSessionGeneration,
  invalidateSession: invalidateSessionGeneration,
  cancelQueries: () => queryClient.cancelQueries(),
  clearQueryClient: () => queryClient.clear(),
  expireSession
});
