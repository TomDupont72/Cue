import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/components/pwa/useInstallPrompt";

type InstallAppButtonProps = {
  className: string;
};

export function InstallAppButton({ className }: InstallAppButtonProps) {
  const { canInstall, install } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <Button variant="ghost" size="lg" className={className} onClick={() => void install()}>
      <Download aria-hidden="true" />
      INSTALLER L'APPLICATION
    </Button>
  );
}
