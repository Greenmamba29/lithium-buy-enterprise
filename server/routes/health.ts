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
 * Check database connectivity
 */
async function checkDatabase(): Promise<{ status: string; error?: string }> {
  try {
    const { error } = await supabaseAdmin.from("suppliers").select("id").limit(1);
    if (error) {
      return { status: "unhealthy", error: error.message };
    }
    return { status: "healthy" };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check Redis connectivity
 */
async function checkRedis(): Promise<{ status: string; error?: string }> {
  try {
    if (!process.env.REDIS_URL && !process.env.UPSTASH_REDIS_REST_URL) {
      return { status: "not_configured" };
    }

    // For Upstash REST API, we can test by making a simple request
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          },
          signal: AbortSignal.timeout(2000), // 2 second timeout
        });
        return response.ok
          ? { status: "healthy" }
          : { status: "unhealthy", error: `HTTP ${response.status}` };
      } catch (error) {
        return {
          status: "unhealthy",
          error: error instanceof Error ? error.message : "Connection failed",
        };
      }
    }

    // For regular Redis URL, we'd need ioredis or similar
    // For now, if URL is configured, assume healthy
    if (process.env.REDIS_URL) {
      return { status: "configured" }; // Can't test without client library
    }

    return { status: "not_configured" };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check external API availability
 */
async function checkExternalAPIs(): Promise<{
  daily: { status: string; error?: string };
  perplexity: { status: string; error?: string };
  gemini: { status: string; error?: string };
}> {
  const results = {
    daily: { status: "not_configured" as string, error: undefined as string | undefined },
    perplexity: { status: "not_configured" as string, error: undefined as string | undefined },
    gemini: { status: "not_configured" as string, error: undefined as string | undefined },
  };

  // Check Daily.co
  if (process.env.DAILY_CO_API_KEY) {
    try {
      const response = await fetch("https://api.daily.co/v1/rooms", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.DAILY_CO_API_KEY}`,
        },
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      results.daily = response.ok
        ? { status: "healthy" }
        : { status: "unhealthy", error: `HTTP ${response.status}` };
    } catch (error) {
      results.daily = {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Check Perplexity (just verify API key format, don't make actual request)
  if (process.env.PERPLEXITY_API_KEY) {
    results.perplexity = { status: "configured" }; // API key present
  }

  // Check Gemini (just verify API key format)
  if (process.env.GEMINI_API_KEY) {
    results.gemini = { status: "configured" }; // API key present
  }

  return results;
}

/**
 * Readiness check endpoint
 * Returns 200 if all critical dependencies are accessible
 */
export async function readinessCheck(_req: Request, res: Response) {
  try {
    const [database, redis, externalAPIs] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkExternalAPIs(),
    ]);

    const isReady =
      database.status === "healthy" &&
      (redis.status === "healthy" || redis.status === "not_configured");

    const statusCode = isReady ? 200 : 503;

    res.status(statusCode).json({
      status: isReady ? "ready" : "not ready",
      timestamp: new Date().toISOString(),
      dependencies: {
        database,
        redis,
        external_apis: externalAPIs,
      },
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




