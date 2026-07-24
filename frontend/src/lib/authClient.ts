import { createAuthClient } from "better-auth/react";

const apiUrl = import.meta.env.VITE_API_URL ?? "/api";
const authBaseUrl = new URL(apiUrl, window.location.origin).origin;

export const authClient = createAuthClient({
  baseURL: authBaseUrl
});
