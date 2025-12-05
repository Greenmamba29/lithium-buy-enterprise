import pino from "pino";

/**
 * Structured logging with Pino
 * Provides JSON logs with levels and context
 */

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV,
    service: "lithiumbuy-api",
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
  });
}



