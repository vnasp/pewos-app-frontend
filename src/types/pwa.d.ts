/**
 * `beforeinstallprompt` no está en lib.dom: es una extensión de Chromium.
 * Se captura en main.tsx antes de que React monte, porque Chrome descarta el
 * evento si nadie lo retiene.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Window {
  __pwaPrompt: BeforeInstallPromptEvent | null;
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent;
}
