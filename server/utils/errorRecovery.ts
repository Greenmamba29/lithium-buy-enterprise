import { logger } from "./logger.js";
import { CircuitBreakerError } from "./circuitBreaker.js";

/**
 * Error Recovery Utilities
 * Provides graceful degradation and user-friendly error handling
 */

export interface ErrorContext {
  service: string;
  operation: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Determine if an error is transient and recoverable
 */
export function isTransientError(error: any): boolean {
  if (error instanceof CircuitBreakerError) {
    return true; // Circuit breaker errors are transient
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true; // Network errors
  }

  if (error?.status) {
    // 5xx errors are transient, 4xx (except 429) are not
    if (error.status >= 500) return true;
    if (error.status === 429) return true; // Rate limit
    return false;
  }

  // Connection errors
  if (error?.code === "ETIMEDOUT" || error?.code === "ECONNRESET" || error?.code === "ECONNREFUSED") {
    return true;
  }

  return false;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: any, context?: ErrorContext): string {
  // Circuit breaker errors
  if (error instanceof CircuitBreakerError) {
    return `${context?.service || "Service"} is temporarily unavailable. Please try again in a few moments.`;
  }

  // Network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return "Network connection error. Please check your internet connection and try again.";
  }

  // HTTP errors
  if (error?.status) {
    switch (error.status) {
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "Authentication required. Please log in and try again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Service temporarily unavailable. Please try again in a few moments.";
      default:
        return "An error occurred. Please try again later.";
    }
  }

  // Database errors
  if (error?.code === "PGRST" || error?.message?.includes("PostgreSQL")) {
    return "Database error. Please try again in a moment.";
  }

  // Generic error
  return "An unexpected error occurred. Please try again later.";
}

/**
 * Handle error with graceful degradation
 */
export function handleErrorWithDegradation(
  error: any,
  context: ErrorContext,
  fallback?: () => any
): any {
  const isTransient = isTransientError(error);
  const userMessage = getUserFriendlyMessage(error, context);

  logger.error(
    {
      error: error instanceof Error ? error.message : String(error),
      context,
      isTransient,
      userMessage,
    },
    "Error occurred, attempting recovery"
  );

  // If we have a fallback and error is transient, use fallback
  if (isTransient && fallback) {
    try {
      logger.info({ context }, "Using fallback due to transient error");
      return fallback();
    } catch (fallbackError) {
      logger.error(
        {
          error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
          context,
        },
        "Fallback also failed"
      );
    }
  }

  // Return error with user-friendly message
  return {
    error: true,
    message: userMessage,
    code: error?.code || error?.status || "UNKNOWN_ERROR",
    transient: isTransient,
    context,
  };
}

/**
 * Wrap async function with error recovery
 */
export function withErrorRecovery<T>(
  fn: () => Promise<T>,
  context: ErrorContext,
  fallback?: () => Promise<T>
): Promise<T> {
  return fn().catch(async (error) => {
    const recovery = handleErrorWithDegradation(error, context, fallback);
    
    // If recovery returned an error object, throw it
    if (recovery?.error) {
      const recoveryError = new Error(recovery.message);
      (recoveryError as any).code = recovery.code;
      (recoveryError as any).transient = recovery.transient;
      throw recoveryError;
    }

    // Otherwise, return the fallback result
    return recovery;
  });
}
