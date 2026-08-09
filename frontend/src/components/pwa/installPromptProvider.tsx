import { useMemo, useSyncExternalStore, type ReactNode } from "react";

import { InstallPromptContext } from "@/components/pwa/installPromptContext";
import {
  getInstallPromptSnapshot,
  showInstallPrompt,
  subscribeToInstallPrompt
} from "@/components/pwa/installPromptStore";

type InstallPromptProviderProps = {
  children: ReactNode;
};

export function InstallPromptProvider({ children }: InstallPromptProviderProps) {
  const { canInstall } = useSyncExternalStore(
    subscribeToInstallPrompt,
    getInstallPromptSnapshot,
    getInstallPromptSnapshot
  );

  const value = useMemo(
    () => ({
      canInstall,
      install: showInstallPrompt
    }),
    [canInstall]
  );

  return <InstallPromptContext.Provider value={value}>{children}</InstallPromptContext.Provider>;
}
