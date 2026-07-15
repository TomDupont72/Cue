import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/api/errors";

type ErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
};

function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 401) {
      return "Tu dois être connecté pour effectuer cette action.";
    }

    if (error.status === 404) {
      return "La ressource demandée est introuvable.";
    }

    if (error.status >= 500) {
      return "Une erreur est survenue sur le serveur.";
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur inattendue est survenue.";
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <AlertCircle className="mb-4 size-8 text-destructive" />

      <h2 className="text-lg font-semibold">Impossible de charger les données</h2>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">{getErrorMessage(error)}</p>

      {onRetry && (
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
