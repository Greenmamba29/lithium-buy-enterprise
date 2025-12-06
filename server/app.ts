import express from "express";
import { setupSecurity } from "./middleware/security.js";
import { setupRateLimiting } from "./middleware/rateLimit.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/logging.js";
import { validateEnvironment } from "./utils/envValidation.js";
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from "./utils/sentry.js";
import { metricsMiddleware } from "./utils/monitoring.js";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Creates and configures the Express application
 * This is exported for use in both regular server and serverless environments
 */
export async function createApp() {
  // Validate environment variables
  try {
    validateEnvironment();
    log("Environment variables validated");
  } catch (error) {
    console.error("Environment validation failed:", error);
    throw error;
  }

  const app = express();

  // Initialize Sentry (must be first)
  initSentry();

  // Sentry request and tracing handlers (must be before other middleware)
  app.use(sentryRequestHandler);
  app.use(sentryTracingHandler);

  // Security middleware (must be early)
  setupSecurity(app);

  // Performance metrics (before request logging)
  app.use(metricsMiddleware);

  // Request logging (before other middleware to capture all requests)
  app.use(requestLogger);

  // Body parsing with size limits
  app.use(
    express.json({
      limit: "10mb",
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false, limit: "10mb" }));

  // Rate limiting
  setupRateLimiting(app);

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        log(logLine);
      }
    });

    next();
  });

  return app;
}
