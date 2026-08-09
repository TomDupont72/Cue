import { useContext } from "react";

import { InstallPromptContext } from "@/components/pwa/installPromptContext";

export function useInstallPrompt() {
  const context = useContext(InstallPromptContext);

  if (!context) {
    throw new Error("useInstallPrompt must be used within an InstallPromptProvider");
  }

  return context;
}
