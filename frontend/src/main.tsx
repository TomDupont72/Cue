import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { InstallPromptProvider } from "@/components/pwa/installPromptProvider";
import { startInstallPromptCapture } from "@/components/pwa/installPromptStore";
import { queryClient } from "@/lib/queryClient";
import "@/index.css";

startInstallPromptCapture();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <InstallPromptProvider>
          <App />
        </InstallPromptProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
