import { useLayoutEffect, useState } from "react";

import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { authClient } from "@/lib/authClient";
import { queryClient } from "@/lib/queryClient";
import { invalidateSessionGeneration } from "@/lib/sessionGeneration";
import Auth from "@/pages/auth.page";
import Router from "@/router";

function App() {
  const { data: session, error, isPending, refetch } = authClient.useSession();
  const [cacheOwnerUserId, setCacheOwnerUserId] = useState<string | null>(null);
  const isUnauthorizedSession = error?.status === 401;
  const currentUserId = isUnauthorizedSession ? null : (session?.user.id ?? null);
  const isChangingUser =
    cacheOwnerUserId !== null && currentUserId !== null && cacheOwnerUserId !== currentUserId;

  useLayoutEffect(() => {
    if (isPending || (error && !isUnauthorizedSession)) {
      return;
    }

    if (cacheOwnerUserId !== null && cacheOwnerUserId !== currentUserId) {
      invalidateSessionGeneration();
      queryClient.clear();
    }

    if (cacheOwnerUserId !== currentUserId) {
      // Keep the authenticated router unmounted until the previous owner's cache is gone.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCacheOwnerUserId(currentUserId);
    }
  }, [cacheOwnerUserId, currentUserId, error, isPending, isUnauthorizedSession]);

  if (isPending) {
    return (
      <main className="flex min-h-screen">
        <LoadingState />
      </main>
    );
  }

  if (isUnauthorizedSession) {
    return <Auth />;
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <ErrorState error={error} onRetry={() => void refetch()} />
      </main>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (isChangingUser) {
    return (
      <main className="flex min-h-screen">
        <LoadingState />
      </main>
    );
  }

  return <Router />;
}

export default App;
