import { STATUS_CODES } from "node:http";
import { AppError } from "./AppError.js";
import type { ErrorResponse } from "./errors.schemas.js";

type ErrorLike = {
  code?: unknown;
  message?: unknown;
  statusCode?: unknown;
  validation?: unknown;
};

function asErrorLike(error: unknown): ErrorLike {
  return error !== null && typeof error === "object" ? error : {};
}

function getStatusCode(error: ErrorLike): number {
  const { statusCode } = error;

  return typeof statusCode === "number" && statusCode >= 400 && statusCode <= 599
    ? statusCode
    : 500;
}

function getFallbackCode(reason: string): string {
  return reason.toUpperCase().replaceAll(/[^A-Z0-9]+/g, "_");
}

export function toErrorResponse(error: unknown): ErrorResponse {
  const errorLike = asErrorLike(error);
  const statusCode = getStatusCode(errorLike);
  const reason = STATUS_CODES[statusCode] ?? "Error";
  const isPublicError = statusCode < 500;
  const details = isPublicError
    ? error instanceof AppError
      ? error.details
      : errorLike.validation
    : undefined;

  return {
    statusCode,
    code:
      isPublicError && typeof errorLike.code === "string"
        ? errorLike.code
        : getFallbackCode(reason),
    error: reason,
    message: isPublicError && typeof errorLike.message === "string" ? errorLike.message : reason,
    ...(details === undefined ? {} : { details })
  };
}
