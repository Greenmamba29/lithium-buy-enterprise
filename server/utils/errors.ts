/**
 * Custom error classes for better error handling
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(400, message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(401, message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, `${resource} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(429, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(500, message);
    this.isOperational = false;
  }
}

/**
 * Check if error is an operational error (expected) vs programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}



