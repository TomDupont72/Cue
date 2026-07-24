import { ErrorState } from "@/components/feedback/errorState";
import { LoadingState } from "@/components/feedback/loadingState";
import { authClient } from "@/lib/authClient";
import Auth from "@/pages/auth.page";
import Router from "@/router";

function App() {
  const { data: session, error, isPending, refetch } = authClient.useSession();

  if (isPending) {
    return (
      <main className="flex min-h-screen">
        <LoadingState />
      </main>
    );
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

  return <Router />;
}

export default App;
