import { AppError } from "./AppError.js";

export function unauthorized(message = "Unauthorized") {
  return new AppError("UNAUTHORIZED", 401, message);
}

export function forbidden(message = "Forbidden") {
  return new AppError("FORBIDDEN", 403, message);
}

export function notFound(resource = "Resource") {
  return new AppError(`${resource.toUpperCase()}_NOT_FOUND`, 404, `${resource} not found`);
}

export function badRequest(code = "BAD_REQUEST", message = "Bad request", details?: unknown) {
  return new AppError(code, 400, message, details);
}
