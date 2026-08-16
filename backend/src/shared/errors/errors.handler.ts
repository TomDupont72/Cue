import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "./AppError.js";
import type { ApiErrorResponse } from "./errors.schemas.js";

const publicClientErrors: Partial<Record<number, ApiErrorResponse>> = {
  400: { code: "BAD_REQUEST", message: "Bad request" },
  401: { code: "UNAUTHORIZED", message: "Unauthorized" },
  403: { code: "FORBIDDEN", message: "Forbidden" },
  404: { code: "NOT_FOUND", message: "Not found" }
};

export function apiErrorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof AppError && error.statusCode < 500) {
    return reply.status(error.statusCode).send({
      code: error.code,
      message: error.message,
      ...(error.details !== undefined && { details: error.details })
    });
  }

  if (error.validation) {
    return reply.status(400).send({
      code: "VALIDATION_ERROR",
      message: "Invalid request",
      details: error.validation
    });
  }

  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    const publicError = publicClientErrors[error.statusCode] ?? {
      code: "REQUEST_ERROR",
      message: "Request failed"
    };

    return reply.status(error.statusCode).send(publicError);
  }

  request.log.error({ err: error }, "Unhandled request error");

  return reply.status(500).send({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error"
  });
}
