import { createContext } from "react";

export type InstallPromptContextValue = {
  canInstall: boolean;
  install: () => Promise<void>;
};

export const InstallPromptContext = createContext<InstallPromptContextValue | null>(null);
