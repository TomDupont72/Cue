import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/api/errors";
import { useTranslation } from "react-i18next";

type ErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
};

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  function getErrorMessage(error: unknown): string {
    if (isApiError(error)) {
      if (error.status in [401, 404, 500]) {
        return t(`error:${error.status}Error`);
      }

      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return t("error:genericError");
  }

  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <AlertCircle className="mb-4 size-8 text-destructive" />

      <h2 className="text-lg font-semibold">{t("error:unableFetch")}</h2>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">{getErrorMessage(error)}</p>

      {onRetry && (
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
