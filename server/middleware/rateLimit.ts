import { type Express, type Request, type Response } from "express";
import rateLimit, { type Store, type IncrementResponse } from "express-rate-limit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting middleware
 * Uses Upstash Redis for distributed rate limiting in production
 * Falls back to in-memory store in development
 */
let redisClient: Redis | null = null;

// Initialize Redis client if credentials are available
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (error) {
    console.warn("Failed to initialize Redis client, using in-memory store:", error);
  }
}

/**
 * Custom store for express-rate-limit using Upstash Redis
 */
class UpstashStore implements Store {
  private redis: Redis;
  public prefix: string;

  constructor(redis: Redis, prefix = "rl:") {
    this.redis = redis;
    this.prefix = prefix;
  }

  async increment(key: string): Promise<rateLimit.IncrementResponse> {
    const fullKey = `${this.prefix}${key}`;
    const count = await this.redis.incr(fullKey);
    
    // Set expiration on first increment
    if (count === 1) {
      await this.redis.expire(fullKey, 60); // 60 seconds default
    }

    return {
      totalHits: count,
      resetTime: new Date(Date.now() + 60000), // Approximate
    };
  }

  async decrement(key: string): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    await this.redis.decr(fullKey);
  }

  async resetKey(key: string): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    await this.redis.del(fullKey);
  }

  async shutdown(): Promise<void> {
    // Upstash Redis doesn't need explicit shutdown
  }
}

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  store: redisClient ? new UpstashStore(redisClient) : undefined,
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === "/health" || req.path === "/ready";
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new UpstashStore(redisClient) : undefined,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Strict rate limiter for quote requests
 * 10 requests per hour per IP
 */
export const quoteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour
  message: "Too many quote requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new UpstashStore(redisClient) : undefined,
});

/**
 * Apply rate limiting to Express app
 */
export function setupRateLimiting(app: Express) {
  // Apply general API limiter to all /api routes
  app.use("/api", apiLimiter);
}




