import { type Express, type Request, type Response } from "express";
import { supabaseAdmin } from "../db/client.js";

/**
 * Health check endpoint
 * Returns 200 if server is running
 */
export function healthCheck(_req: Request, res: Response) {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "lithiumbuy-api",
  });
}

/**
 * Readiness check endpoint
 * Returns 200 if database is accessible
 */
export async function readinessCheck(_req: Request, res: Response) {
  try {
    // Simple query to check database connectivity
    const { error } = await supabaseAdmin.from("suppliers").select("id").limit(1);

    if (error) {
      return res.status(503).json({
        status: "not ready",
        error: "Database connection failed",
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "not ready",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Register health check routes
 */
export function registerHealthRoutes(app: Express) {
  app.get("/health", healthCheck);
  app.get("/ready", readinessCheck);
}




