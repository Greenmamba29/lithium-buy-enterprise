import { Redis } from "@upstash/redis";
import { logger } from "../utils/logger.js";

/**
 * Cache Service
 * Provides Redis-based caching for frequently accessed data
 */

let redisClient: Redis | null = null;

// Initialize Redis client
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (error) {
    logger.warn({ source: "cache" }, "Redis not available, caching disabled");
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
 * Set cached value
 */
export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 3600
): Promise<void> {
  if (!redisClient) return;

  try {
    await redisClient.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    logger.error(
      { source: "cache", key, error: error instanceof Error ? error.message : "Unknown" },
      "Failed to set cache"
    );
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
 * Cache middleware helper
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  // Try cache first
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch and cache
  const data = await fetcher();
  await setCache(key, data, ttlSeconds);
  return data;
}



