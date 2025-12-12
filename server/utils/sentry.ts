/**
 * Sentry Integration for Error Tracking
 * Provides error tracking and performance monitoring
 */

let sentryInitialized = false;

/**
 * Initialize Sentry (if DSN is provided)
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.log("Sentry DSN not provided, error tracking disabled");
    return;
  }

  try {
    // Dynamic import to avoid requiring Sentry if not configured
    import("@sentry/node").then((Sentry) => {
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || "development",
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        integrations: [
          // Add integrations as needed
        ],
      });

      sentryInitialized = true;
      console.log("Sentry initialized successfully");
    });
  } catch (error) {
    console.error("Failed to initialize Sentry:", error);
  }
}

/**
 * Capture an exception
 */
export async function captureException(error: Error, context?: Record<string, any>): Promise<void> {
  if (!sentryInitialized) {
    return;
  }

  try {
    const Sentry = await import("@sentry/node");
    Sentry.captureException(error, {
      extra: context,
    });
  } catch (err) {
    // Silently fail if Sentry is not available
  }
}

/**
 * Capture a message
 */
export async function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, any>
): Promise<void> {
  if (!sentryInitialized) {
    return;
  }

  try {
    const Sentry = await import("@sentry/node");
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  } catch (err) {
    // Silently fail if Sentry is not available
  }
}

/**
 * Add breadcrumb
 */
export async function addBreadcrumb(
  message: string,
  category?: string,
  level: "info" | "warning" | "error" = "info",
  data?: Record<string, any>
): Promise<void> {
  if (!sentryInitialized) {
    return;
  }

  try {
    const Sentry = await import("@sentry/node");
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
    });
  } catch (err) {
    // Silently fail if Sentry is not available
  }
}

/**
 * Set user context
 */
export async function setUser(user: {
  id?: string;
  email?: string;
  username?: string;
}): Promise<void> {
  if (!sentryInitialized) {
    return;
  }

  try {
    const Sentry = await import("@sentry/node");
    Sentry.setUser(user);
  } catch (err) {
    // Silently fail if Sentry is not available
  }
}

/**
 * Express error handler middleware
 */
export function sentryErrorHandler(err: any, req: any, res: any, next: any) {
  if (sentryInitialized) {
    captureException(err, {
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
  }
  next(err);
}

/**
 * Express request handler middleware
 * Note: In @sentry/node v8+, request handling is automatic via the init() integrations
 */
export function sentryRequestHandler(req: any, res: any, next: any) {
  // In Sentry v8+, request handling is done automatically via integrations
  // This middleware is kept for compatibility but just passes through
  next();
}

/**
 * Express tracing handler middleware
 * Note: In @sentry/node v8+, tracing is automatic via the init() integrations
 */
export function sentryTracingHandler(req: any, res: any, next: any) {
  // In Sentry v8+, tracing is done automatically via integrations
  // This middleware is kept for compatibility but just passes through
  next();
}
