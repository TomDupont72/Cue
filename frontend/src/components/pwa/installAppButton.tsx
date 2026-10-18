import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useInstallPrompt } from "@/components/pwa/useInstallPrompt";
import { Button } from "@/components/ui/button";

type InstallAppButtonProps = {
  className: string;
};

export function InstallAppButton({ className }: InstallAppButtonProps) {
  const { canInstall, install } = useInstallPrompt();
  const { t } = useTranslation();

  if (!canInstall) return null;

  return (
    <Button variant="ghost" size="lg" className={className} onClick={() => void install()}>
      <Download aria-hidden="true" />
      {t("common:app.install").toUpperCase()}
    </Button>
  );
}
