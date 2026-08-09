export type ApiErrorData = {
  code?: string;
  message?: string;
  details?: unknown;
};

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
