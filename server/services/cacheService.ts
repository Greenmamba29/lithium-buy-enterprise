import { Redis } from "@upstash/redis";
import { logger } from "../utils/logger.js";
import { supabaseAdmin } from "../db/client.js";

/**
 * Cache Service with Fallback Strategy
 * Provides Redis-based caching with in-memory and database fallbacks
 */

let redisClient: Redis | null = null;

// In-memory cache fallback
const memoryCache = new Map<string, { value: any; expires: number }>();
const MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Initialize Redis client
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (error) {
    logger.warn({ source: "cache" }, "Redis not available, using in-memory cache fallback");
  }
}

/**
 * Get from in-memory cache
 */
function getMemoryCache<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expires) {
    memoryCache.delete(key);
    return null;
  }

  return cached.value as T;
}

/**
 * Set in-memory cache
 */
function setMemoryCache(key: string, value: any, ttlMs: number = MEMORY_CACHE_TTL): void {
  memoryCache.set(key, {
    value,
    expires: Date.now() + ttlMs,
  });

  // Clean up expired entries periodically
  if (memoryCache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of memoryCache.entries()) {
      if (now > v.expires) {
        memoryCache.delete(k);
      }
    }
  }
}

/**
 * Get cached value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisClient) return null;

  try {
    const value = await redisClient.get(key);
    return value as T | null;
  } catch (error) {
    logger.error(
      { source: "cache", key, error: error instanceof Error ? error.message : "Unknown" },
      "Failed to get from cache"
    );
    return null;
  }
}

/**
 * Set cached value with fallback strategy
 */
export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 3600
): Promise<void> {
  // Set in memory cache immediately
  setMemoryCache(key, value, ttlSeconds * 1000);

  // Try to set in Redis
  if (redisClient) {
    try {
      await redisClient.set(key, value, { ex: ttlSeconds });
    } catch (error) {
      logger.warn(
        { source: "cache", key, error: error instanceof Error ? error.message : "Unknown" },
        "Failed to set Redis cache, using memory cache only"
      );
    }
  }
}

/**
 * Delete cached value
 */
export async function deleteCache(key: string): Promise<void> {
  if (!redisClient) return;

  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error(
      { source: "cache", key, error: error instanceof Error ? error.message : "Unknown" },
      "Failed to delete from cache"
    );
  }
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  supplier: (id: string) => `supplier:${id}`,
  suppliers: (filters: string) => `suppliers:${filters}`,
  supplierProducts: (id: string) => `supplier:${id}:products`,
  supplierReviews: (id: string, page: number) => `supplier:${id}:reviews:${page}`,
};

/**
 * Cache middleware helper with database fallback
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600,
  dbFallback?: () => Promise<T>
): Promise<T> {
  // Try cache first
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Try database fallback if provided
  if (dbFallback) {
    try {
      const dbData = await dbFallback();
      if (dbData !== null) {
        // Cache the database result
        await setCache(key, dbData, ttlSeconds);
        return dbData;
      }
    } catch (error) {
      logger.warn(
        { source: "cache", key, error: error instanceof Error ? error.message : "Unknown" },
        "Database fallback failed, using fetcher"
      );
    }
  }

  // Fetch and cache
  const data = await fetcher();
  await setCache(key, data, ttlSeconds);
  return data;
}

/**
 * Warm cache with frequently accessed data
 */
export async function warmCache(): Promise<void> {
  logger.info({ source: "cache" }, "Starting cache warming");

  try {
    // Warm supplier list cache
    const { data: suppliers } = await supabaseAdmin
      .from("suppliers")
      .select("id, name, verification_tier")
      .limit(100);

    if (suppliers) {
      for (const supplier of suppliers) {
        await setCache(cacheKeys.supplier(supplier.id), supplier, 3600);
      }
      logger.info({ source: "cache", count: suppliers.length }, "Warmed supplier cache");
    }
  } catch (error) {
    logger.error(
      { source: "cache", error: error instanceof Error ? error.message : "Unknown" },
      "Failed to warm cache"
    );
  }
}




