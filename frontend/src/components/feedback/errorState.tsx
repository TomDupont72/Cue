import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/api/errors";
import { useTranslation } from "react-i18next";
import { StatePanel } from "@/components/feedback/statePanel";

type ErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
};

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  function getErrorMessage(error: unknown): string {
    if (isApiError(error)) {
      if (error.status in [401, 404, 500]) {
        return t(`errors:${error.status}Error`);
      }

      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return t("errors:genericError");
  }

  return (
    <StatePanel
      title={t("errors:unableFetch")}
      description={getErrorMessage(error)}
      icon={<AlertCircle className="size-8" />}
      action={
        onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            Réessayer
          </Button>
        ) : undefined
      }
      tone="destructive"
    />
  );
}
