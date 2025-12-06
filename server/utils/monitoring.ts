import { logger } from "./logger.js";

/**
 * Performance Monitoring Utilities
 * Tracks API response times, database query times, and other metrics
 */

interface Metric {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
  timestamp: Date;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private readonly maxMetrics = 10000; // Keep last 10k metrics in memory

  /**
   * Record a metric
   */
  record(name: string, value: number, unit: string = "ms", tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      unit,
      tags,
      timestamp: new Date(),
    };

    this.metrics.push(metric);

    // Trim if too many metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get metrics for a time range
   */
  getMetrics(name?: string, startTime?: Date, endTime?: Date): Metric[] {
    let filtered = this.metrics;

    if (name) {
      filtered = filtered.filter((m) => m.name === name);
    }

    if (startTime) {
      filtered = filtered.filter((m) => m.timestamp >= startTime);
    }

    if (endTime) {
      filtered = filtered.filter((m) => m.timestamp <= endTime);
    }

    return filtered;
  }

  /**
   * Get aggregated statistics
   */
  getStats(name: string, startTime?: Date, endTime?: Date): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    const metrics = this.getMetrics(name, startTime, endTime);
    const values = metrics.map((m) => m.value).sort((a, b) => a - b);

    if (values.length === 0) {
      return {
        count: 0,
        sum: 0,
        avg: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = values[0];
    const max = values[values.length - 1];
    const p50 = values[Math.floor(values.length * 0.5)];
    const p95 = values[Math.floor(values.length * 0.95)];
    const p99 = values[Math.floor(values.length * 0.99)];

    return {
      count: values.length,
      sum,
      avg,
      min,
      max,
      p50,
      p95,
      p99,
    };
  }

  /**
   * Clear old metrics
   */
  clear(olderThan?: Date): void {
    if (olderThan) {
      this.metrics = this.metrics.filter((m) => m.timestamp >= olderThan);
    } else {
      this.metrics = [];
    }
  }
}

export const metricsCollector = new MetricsCollector();

/**
 * Measure execution time of an async function
 */
export async function measureTime<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    metricsCollector.record(name, duration, "ms", tags);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    metricsCollector.record(`${name}_error`, duration, "ms", { ...tags, error: "true" });
    throw error;
  }
}

/**
 * Measure execution time of a sync function
 */
export function measureTimeSync<T>(
  name: string,
  fn: () => T,
  tags?: Record<string, string>
): T {
  const start = Date.now();
  try {
    const result = fn();
    const duration = Date.now() - start;
    metricsCollector.record(name, duration, "ms", tags);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    metricsCollector.record(`${name}_error`, duration, "ms", { ...tags, error: "true" });
    throw error;
  }
}

/**
 * Express middleware to track request metrics
 */
export function metricsMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  const path = req.path;
  const method = req.method;

  res.on("finish", () => {
    const duration = Date.now() - start;
    metricsCollector.record("http_request", duration, "ms", {
      method,
      path,
      status: res.statusCode.toString(),
    });
  });

  next();
}

/**
 * Get performance summary for health checks
 */
export function getPerformanceSummary(): {
  api: {
    avg: number;
    p95: number;
    p99: number;
  };
  db: {
    avg: number;
    p95: number;
    p99: number;
  };
} {
  const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);

  const apiStats = metricsCollector.getStats("http_request", last5Minutes);
  const dbStats = metricsCollector.getStats("db_query", last5Minutes);

  return {
    api: {
      avg: apiStats.avg,
      p95: apiStats.p95,
      p99: apiStats.p99,
    },
    db: {
      avg: dbStats.avg,
      p95: dbStats.p95,
      p99: dbStats.p99,
    },
  };
}
