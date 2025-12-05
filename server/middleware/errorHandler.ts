import { type Request, type Response, type NextFunction } from "express";
import { AppError, isOperationalError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

/**
 * Centralized error handling middleware
 * Never exposes stack traces in production
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Generate request ID for tracking
  const requestId = req.headers["x-request-id"] || `req-${Date.now()}`;

  // Log error with context
  const errorContext = {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    error: {
      name: err.name,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  };

  if (err instanceof AppError && err.isOperational) {
    logger.warn(errorContext, `Operational error: ${err.message}`);
  } else {
    logger.error(errorContext, `Unexpected error: ${err.message}`);
  }

  // Handle operational errors (expected errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.name,
        requestId,
        ...(process.env.NODE_ENV === "development" && {
          stack: err.stack,
        }),
      },
    });
  }

  // Handle validation errors (Zod, etc.)
  if (err.name === "ZodError" && "issues" in err) {
    return res.status(400).json({
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        requestId,
        details: (err as any).issues,
        ...(process.env.NODE_ENV === "development" && {
          stack: err.stack,
        }),
      },
    });
  }

  // Handle programming errors (unexpected errors)
  // Never expose stack traces or internal details in production
  const statusCode = (err as any).statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : err.message;

  return res.status(statusCode).json({
    error: {
      message,
      code: "INTERNAL_ERROR",
      requestId,
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack,
        details: err,
      }),
    },
  });
}

/**
 * Async error wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: "NOT_FOUND",
    },
  });
}

