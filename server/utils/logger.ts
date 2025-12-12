import pino from "pino";
import { createWriteStream } from "fs";
import { join } from "path";

/**
 * Structured logging with Pino
 * Provides JSON logs with levels, context, and log aggregation
 */

const isDevelopment = process.env.NODE_ENV === "development";

// Log aggregation targets - use mutable array type
const transports: Array<pino.TransportTargetOptions> = [];

// Development: Pretty console output
if (isDevelopment) {
  transports.push({
    target: "pino-pretty",
    level: "debug",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  });
}

// Production: File logging
if (process.env.LOG_FILE_PATH) {
  transports.push({
    target: "pino/file",
    level: "info",
    options: {
      destination: process.env.LOG_FILE_PATH,
    },
  });
}

// Error log file (separate file for errors)
if (process.env.ERROR_LOG_FILE_PATH) {
  transports.push({
    target: "pino/file",
    level: "error",
    options: {
      destination: process.env.ERROR_LOG_FILE_PATH,
    },
  });
}

// Log aggregation service (Datadog, Loggly, etc.)
if (process.env.LOG_AGGREGATION_URL) {
  transports.push({
    target: "pino-http-print",
    level: "info",
    options: {
      destination: process.env.LOG_AGGREGATION_URL,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LOG_AGGREGATION_API_KEY && {
          Authorization: `Bearer ${process.env.LOG_AGGREGATION_API_KEY}`,
        }),
      },
    },
  });
}

// Create logger with transports
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  transport: transports.length > 0 ? { targets: transports } : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV,
    service: "lithiumbuy-api",
    version: process.env.APP_VERSION || "1.0.0",
    hostname: process.env.HOSTNAME || "unknown",
  },
  // Redact sensitive information
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "token",
      "apiKey",
      "secret",
      "access_token",
      "refresh_token",
    ],
    remove: true,
  },
});

/**
 * Create a child logger with additional context
 */
export function createLogger(context: Record<string, any>) {
  return logger.child(context);
}

/**
 * Request logger middleware context
 */
export function createRequestLogger(requestId: string, method: string, path: string) {
  return logger.child({
    requestId,
    method,
    path,
    type: "http_request",
  });
}

/**
 * Database query logger
 */
export function createDbLogger(query: string, duration?: number) {
  return logger.child({
    type: "db_query",
    query: query.substring(0, 200), // Truncate long queries
    duration,
  });
}

/**
 * Performance logger
 */
export function createPerformanceLogger(operation: string, duration: number, metadata?: Record<string, any>) {
  return logger.child({
    type: "performance",
    operation,
    duration,
    ...metadata,
  });
}

/**
 * Security event logger
 */
export function createSecurityLogger(event: string, metadata?: Record<string, any>) {
  return logger.child({
    type: "security",
    event,
    ...metadata,
  });
}

/**
 * Business event logger (for analytics)
 */
export function createBusinessLogger(event: string, metadata?: Record<string, any>) {
  return logger.child({
    type: "business",
    event,
    ...metadata,
  });
}

/**
 * Log aggregation helpers
 */

/**
 * Flush logs (useful for graceful shutdown)
 */
export async function flushLogs(): Promise<void> {
  return new Promise((resolve) => {
    logger.flush(() => {
      resolve();
    });
  });
}

/**
 * Log levels
 */
export const LogLevel = {
  TRACE: 10,
  DEBUG: 20,
  INFO: 30,
  WARN: 40,
  ERROR: 50,
  FATAL: 60,
} as const;

/**
 * Structured log entry interface
 */
export interface LogEntry {
  level: string;
  time: string;
  msg: string;
  [key: string]: any;
}

/**
 * Log aggregation service integration
 * Supports: Datadog, Loggly, CloudWatch, etc.
 */
export class LogAggregator {
  private buffer: LogEntry[] = [];
  private bufferSize = 100;
  private flushInterval = 5000; // 5 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    if (process.env.LOG_AGGREGATION_ENABLED === "true") {
      this.startFlushTimer();
    }
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  async addLog(entry: LogEntry) {
    this.buffer.push(entry);

    if (this.buffer.length >= this.bufferSize) {
      await this.flush();
    }
  }

  async flush() {
    if (this.buffer.length === 0) return;

    const logs = [...this.buffer];
    this.buffer = [];

    // Send to aggregation service
    if (process.env.LOG_AGGREGATION_URL) {
      try {
        await fetch(process.env.LOG_AGGREGATION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(process.env.LOG_AGGREGATION_API_KEY && {
              Authorization: `Bearer ${process.env.LOG_AGGREGATION_API_KEY}`,
            }),
          },
          body: JSON.stringify({ logs }),
        });
      } catch (error) {
        // Silently fail - don't break application if log aggregation fails
        console.error("Failed to send logs to aggregation service:", error);
      }
    }
  }

  stop() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Global log aggregator instance
export const logAggregator = new LogAggregator();

// Graceful shutdown
process.on("SIGTERM", async () => {
  await flushLogs();
  logAggregator.stop();
});

process.on("SIGINT", async () => {
  await flushLogs();
  logAggregator.stop();
});




