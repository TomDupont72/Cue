import { z } from "zod";
import { ApiError, type ApiErrorData } from "./errors";

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

type ApiClientOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: QueryParams;
  querySchema?: z.ZodType<QueryParams>;
};

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_URL}${normalizedPath}`, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  return text || undefined;
}

function getErrorData(body: unknown): ApiErrorData {
  if (!body || typeof body !== "object") {
    return {};
  }

  const data = body as Record<string, unknown>;

  if (typeof data.message === "string" || typeof data.code === "string") {
    return {
      code: typeof data.code === "string" ? data.code : undefined,
      message: typeof data.message === "string" ? data.message : undefined,
      details: data.details
    };
  }

  if (data.error && typeof data.error === "object") {
    const error = data.error as Record<string, unknown>;

    return {
      code: typeof error.code === "string" ? error.code : undefined,
      message: typeof error.message === "string" ? error.message : undefined,
      details: error.details
    };
  }

  return {};
}

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { query, querySchema, body, headers, ...requestOptions } = options;

  let validatedQuery = query;

  if (query && querySchema) {
    const result = querySchema.safeParse(query);

    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Les paramètres envoyés sont invalides.";

      throw new ApiError(message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    validatedQuery = result.data;
  }

  const isFormData = body instanceof FormData;

  const response = await fetch(buildUrl(path, validatedQuery), {
    ...requestOptions,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(!isFormData && body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers
    },
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body)
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const errorData = getErrorData(responseBody);

    throw new ApiError(
      errorData.message ?? `Request failed with status ${response.status}`,
      response.status,
      errorData.code,
      errorData.details
    );
  }

  return responseBody as T;
}
