import { z } from "zod";
import type { ErrorResponse } from "@/api/generated/cue-api";

const errorResponseSchema = z
  .object({
    statusCode: z.number().int().min(400).max(599),
    code: z.string(),
    error: z.string(),
    message: z.string(),
    details: z.unknown().optional()
  })
  .strict() satisfies z.ZodType<ErrorResponse>;

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;
  readonly isSessionExpired: boolean;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
    isSessionExpired = false
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.isSessionExpired = isSessionExpired;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isSessionExpiredApiError(error: unknown): error is ApiError {
  return isApiError(error) && error.isSessionExpired;
}

export function createApiError(body: unknown, status: number, isSessionExpired = false): ApiError {
  const result = errorResponseSchema.safeParse(body);
  const errorResponse =
    result.success && result.data.statusCode === status ? result.data : undefined;

  return new ApiError(
    errorResponse?.message ?? `Request failed with status ${status}`,
    status,
    errorResponse?.code,
    errorResponse?.details,
    isSessionExpired
  );
}

export async function normalizeApiClientError(
  error: unknown,
  response: Response | undefined,
  recoverUnauthorized: () => Promise<string>
): Promise<unknown> {
  if (error instanceof ApiError || !response || response.ok) {
    return error;
  }

  const unauthorizedRecovery = response.status === 401 ? await recoverUnauthorized() : undefined;

  return createApiError(error, response.status, unauthorizedRecovery === "session-expired");
}
