interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

type InstallPromptSnapshot = {
  canInstall: boolean;
};

let installPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
let installPending = false;
let started = false;
let snapshot: InstallPromptSnapshot = { canInstall: false };

const listeners = new Set<() => void>();

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as NavigatorWithStandalone).standalone)
  );
}

function updateSnapshot() {
  snapshot = {
    canInstall: !installed && !installPending && installPrompt !== null
  };

  for (const listener of listeners) {
    listener();
  }
}

export function startInstallPromptCapture() {
  if (started) return;

  started = true;
  installed = isStandalone();
  updateSnapshot();

  const displayMode = window.matchMedia("(display-mode: standalone)");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event as BeforeInstallPromptEvent;
    updateSnapshot();
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    installed = true;
    updateSnapshot();
  });

  displayMode.addEventListener("change", () => {
    installed = isStandalone();
    updateSnapshot();
  });
}

export function subscribeToInstallPrompt(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getInstallPromptSnapshot() {
  return snapshot;
}

export async function showInstallPrompt() {
  if (!installPrompt || installPending) return;

  const prompt = installPrompt;
  installPrompt = null;
  installPending = true;
  updateSnapshot();

  try {
    await prompt.prompt();
    await prompt.userChoice;
  } catch {
    // The browser may still expose its native install action if the custom prompt fails.
  } finally {
    installPending = false;
    updateSnapshot();
  }
}
