import { Queue, Worker, type ConnectionOptions } from "bullmq";
import { logger } from "../utils/logger.js";

/**
 * Job Queue Setup
 * Uses BullMQ for background job processing
 */

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn("Redis not configured. Job queue will not work.");
}

// Helper to create connection options
function getConnectionOptions(): ConnectionOptions | undefined {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return {
      host: process.env.UPSTASH_REDIS_REST_URL,
      password: process.env.UPSTASH_REDIS_REST_TOKEN,
    } as ConnectionOptions;
  }
  return undefined;
}

// Create queues with optional connection
// BullMQ allows connection to be undefined when Redis is not configured
const connectionOpts = getConnectionOptions();
export const emailQueue = new Queue("emails", connectionOpts ? { connection: connectionOpts } : {});

export const dataSyncQueue = new Queue("data-sync", {
  connection: getConnectionOptions(),
});

export const telebuyQueue = new Queue("telebuy", connectionOpts ? { connection: connectionOpts } : {});

export const perplexityQueue = new Queue("perplexity", {
  connection: getConnectionOptions(),
});

/**
 * Email worker
 */
export const emailWorker = new Worker(
  "emails",
  async (job) => {
    logger.info({ source: "queue", jobId: job.id, jobName: job.name }, "Processing email job");
    // Use sendEmailSync to actually send the email (not enqueue another job)
    const { sendEmailSync } = await import("../services/emailService.js");
    await sendEmailSync(job.data);
  },
  connectionOpts ? { connection: connectionOpts } : {}
);

/**
 * Data sync worker
 */
export const dataSyncWorker = new Worker(
  "data-sync",
  async (job) => {
    logger.info({ source: "queue", jobId: job.id, jobName: job.name }, "Processing data sync job");
    // Data sync jobs can be added here as needed
  },
  connectionOpts ? { connection: connectionOpts } : {}
);

/**
 * TELEBUY worker
 */
export const telebuyWorker = new Worker(
  "telebuy",
  async (job) => {
    logger.info({ source: "queue", jobId: job.id, jobName: job.name }, "Processing TELEBUY job");
    if (job.name === "post-call-automation") {
      const { runPostCallAutomation } = await import("./postCallAutomation.js");
      await runPostCallAutomation(job.data.sessionId);
    }
  },
  connectionOpts ? { connection: connectionOpts } : {}
);

/**
 * Perplexity worker
 */
export const perplexityWorker = new Worker(
  "perplexity",
  async (job) => {
    logger.info({ source: "queue", jobId: job.id, jobName: job.name }, "Processing Perplexity job");
    const { syncPriceData, syncMarketNews, detectArbitrage, generateDailyBriefingJob, analyzeMarketTrends } = await import("./perplexityDataSync.js");
    
    switch (job.name) {
      case "perplexity-price-sync":
        await syncPriceData();
        break;
      case "perplexity-news-sync":
        await syncMarketNews();
        break;
      case "perplexity-arbitrage":
        await detectArbitrage();
        break;
      case "perplexity-daily-briefing":
        await generateDailyBriefingJob();
        break;
      case "perplexity-trend-analysis":
        await analyzeMarketTrends();
        break;
      default:
        logger.warn({ jobName: job.name }, "Unknown Perplexity job name");
    }
  },
  connectionOpts ? { connection: connectionOpts } : {}
);

/**
 * Generic function to add a job to any queue
 */
export function addJob(
  jobName: string,
  jobFunction: () => Promise<void>,
  options?: {
    repeat?: {
      every?: number; // milliseconds
      pattern?: string; // cron pattern
    };
    delay?: number; // milliseconds
  }
): void {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    logger.warn({ jobName }, "Redis not configured, job will not be scheduled");
    return;
  }

  // Determine which queue to use based on job name
  let queue: Queue;
  if (jobName.startsWith("perplexity-")) {
    queue = perplexityQueue;
  } else if (jobName.startsWith("email-")) {
    queue = emailQueue;
  } else if (jobName.startsWith("data-sync-")) {
    queue = dataSyncQueue;
  } else if (jobName.startsWith("telebuy-")) {
    queue = telebuyQueue;
  } else {
    queue = dataSyncQueue; // Default queue
  }

  if (options?.repeat) {
    if (options.repeat.every) {
      // Recurring job with interval
      queue.add(
        jobName,
        {},
        {
          repeat: {
            every: options.repeat.every,
          },
        }
      );
    } else if (options.repeat.pattern) {
      // Cron pattern
      queue.add(
        jobName,
        {},
        {
          repeat: {
            pattern: options.repeat.pattern,
          },
        }
      );
    }
  } else {
    // One-time job
    queue.add(
      jobName,
      {},
      {
        delay: options?.delay || 0,
      }
    );
  }

  logger.info({ jobName, queue: queue.name }, "Job added to queue");
}

