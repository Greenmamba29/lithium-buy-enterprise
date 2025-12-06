import { logger } from "./logger.js";

/**
 * Retry utility for handling transient failures
 * Implements exponential backoff with jitter
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  retryable?: (error: any) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  jitter: true,
  retryable: (error: any) => {
    // Retry on network errors, timeouts, and 5xx errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return true; // Network error
    }
    if (error?.status >= 500 && error?.status < 600) {
      return true; // Server error
    }
    if (error?.code === "ETIMEDOUT" || error?.code === "ECONNRESET") {
      return true; // Timeout or connection reset
    }
    return false;
  },
};

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: any;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (!opts.retryable(error)) {
        logger.warn(
          { attempt, error: error instanceof Error ? error.message : String(error) },
          "Error is not retryable, failing immediately"
        );
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        logger.error(
          { attempt, maxAttempts: opts.maxAttempts, error: error instanceof Error ? error.message : String(error) },
          "Max retry attempts reached"
        );
        throw error;
      }

      // Calculate delay with exponential backoff
      if (opts.jitter) {
        // Add random jitter (±20%)
        const jitterAmount = delay * 0.2;
        const jitter = (Math.random() * 2 - 1) * jitterAmount;
        delay = Math.min(delay + jitter, opts.maxDelay);
      } else {
        delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
      }

      logger.warn(
        {
          attempt,
          maxAttempts: opts.maxAttempts,
          delayMs: Math.round(delay),
          error: error instanceof Error ? error.message : String(error),
        },
        "Retrying after error"
      );

      await new Promise((resolve) => setTimeout(resolve, Math.round(delay)));
    }
  }

  throw lastError;
}

