import { z } from "zod";
import { createClient } from "@/api/generated/client/cue-api";
import { ApiError, normalizeApiClientError } from "@/api/errors";
import { handleUnauthorizedResponse } from "@/lib/sessionManager";

const API_URL = import.meta.env.VITE_API_URL ?? "/api";
const OPENAPI_PREFIX = "/api";

function getClientBaseUrl(apiUrl: string): string {
  const resolvedApiUrl = new URL(apiUrl, window.location.origin);
  const normalizedPath = resolvedApiUrl.pathname.replace(/\/$/, "");

  if (normalizedPath.endsWith(OPENAPI_PREFIX)) {
    resolvedApiUrl.pathname = normalizedPath.slice(0, -OPENAPI_PREFIX.length) || "/";
  }

  resolvedApiUrl.search = "";
  resolvedApiUrl.hash = "";

  return resolvedApiUrl.toString().replace(/\/$/, "");
}

export function validateRequest<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Les paramètres envoyés sont invalides.";

    throw new ApiError(message, 400, "VALIDATION_ERROR", result.error.issues);
  }

  return result.data;
}

export const cueApiClient = createClient({
  baseUrl: getClientBaseUrl(API_URL),
  credentials: "include",
  headers: {
    Accept: "application/json"
  }
});

cueApiClient.interceptors.error.use(async (error, response) => {
  return normalizeApiClientError(error, response, handleUnauthorizedResponse);
});

export const sdkRequestOptions = {
  client: cueApiClient,
  throwOnError: true
} as const;

export async function getSdkData<T>(request: Promise<{ data: T }>): Promise<T> {
  return (await request).data;
}
