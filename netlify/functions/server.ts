import serverless from "serverless-http";
import { createServer } from "http";
import { createApp } from "../../server/app";
import { registerRoutes } from "../../server/routes";
import { errorHandler, notFoundHandler } from "../../server/middleware/errorHandler";
import { sentryErrorHandler } from "../../server/utils/sentry";

// Initialize the Express app
let appPromise: Promise<any>;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const app = await createApp();

      // Create a mock HTTP server for routes that need it
      const httpServer = createServer(app);

      // Register all application routes
      await registerRoutes(httpServer, app);

      // 404 handler for undefined routes (must be before error handler)
      app.use(notFoundHandler);

      // Sentry error handler (before general error handler)
      app.use(sentryErrorHandler);

      // Error handler (must be last)
      app.use(errorHandler);

      return app;
    })();
  }
  return appPromise;
}

// Create the serverless handler
export const handler = async (event: any, context: any) => {
  const app = await getApp();
  const serverlessHandler = serverless(app, {
    binary: [
      'application/octet-stream',
      'image/*',
      'video/*',
      'audio/*',
      'font/*',
    ],
  });

  return serverlessHandler(event, context);
};
