import { type Express, type Request, type Response } from "express";
import { supabaseAdmin } from "../db/client.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/auth.js";
import {
  fetchLithiumPrices,
  analyzeNewsSentiment,
  detectArbitrageOpportunities,
  generateDailyBriefing,
} from "../services/perplexityService.js";
import { syncPriceData, syncMarketNews, detectArbitrage } from "../jobs/perplexityDataSync.js";
import { logger } from "../utils/logger.js";

/**
 * GET /api/perplexity/prices
 * Fetch real-time lithium prices
 */
export const getPrices = asyncHandler(async (req: Request, res: Response) => {
  const productType = req.query.productType as "raw" | "compound" | "processed" | undefined;
  const purityLevel = req.query.purityLevel as "99" | "99.5" | "99.9" | undefined;
  const location = req.query.location as string | undefined;

  // Try to get from database first (cached)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  let query = supabaseAdmin
    .from("price_data")
    .select("*")
    .gte("timestamp", oneHourAgo.toISOString())
    .order("timestamp", { ascending: false })
    .limit(100);

  if (productType) {
    query = query.eq("product_type", productType);
  }
  if (purityLevel) {
    query = query.eq("purity_level", purityLevel);
  }
  if (location) {
    query = query.or(`location_country.ilike.%${location}%,location_city.ilike.%${location}%`);
  }

  const { data: cachedPrices, error } = await query;

  if (error) {
    logger.warn({ error: error.message }, "Failed to fetch cached prices");
  }

  // If we have recent cached data, return it
  if (cachedPrices && cachedPrices.length > 0) {
    return res.json({
      data: cachedPrices,
      source: "cache",
    });
  }

  // Otherwise, fetch fresh data from Perplexity
  try {
    const prices = await fetchLithiumPrices({
      productType,
      purityLevel,
      location,
    });

    res.json({
      data: prices,
      source: "perplexity",
    });
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to fetch prices from Perplexity"
    );
    throw error;
  }
});

/**
 * GET /api/perplexity/news
 * Fetch market news with sentiment
 */
export const getNews = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const sentiment = req.query.sentiment as string | undefined;

  let query = supabaseAdmin
    .from("market_news")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (sentiment) {
    query = query.eq("sentiment_label", sentiment);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch news: ${error.message}`);
  }

  res.json({
    data: data || [],
  });
});

/**
 * GET /api/perplexity/arbitrage
 * Fetch arbitrage opportunities
 */
export const getArbitrageOpportunities = asyncHandler(async (req: Request, res: Response) => {
  const minProfit = req.query.minProfit ? parseFloat(req.query.minProfit as string) : undefined;
  const status = (req.query.status as string) || "active";

  let query = supabaseAdmin
    .from("arbitrage_opportunities")
    .select("*")
    .eq("status", status)
    .order("estimated_profit", { ascending: false })
    .limit(50);

  if (minProfit) {
    query = query.gte("estimated_profit", minProfit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch arbitrage opportunities: ${error.message}`);
  }

  res.json({
    data: data || [],
  });
});

/**
 * GET /api/perplexity/briefing
 * Fetch daily market briefing
 */
export const getBriefing = asyncHandler(async (req: Request, res: Response) => {
  const date = req.query.date as string | undefined;

  let query = supabaseAdmin
    .from("market_briefings")
    .select("*")
    .order("briefing_date", { ascending: false })
    .limit(1);

  if (date) {
    query = query.eq("briefing_date", date);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch briefing: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return res.status(404).json({
      error: "No briefing found for the specified date",
    });
  }

  res.json({
    data: data[0],
  });
});

/**
 * POST /api/perplexity/sync/prices
 * Manually trigger price data sync (admin only)
 */
export const syncPrices = asyncHandler(async (req: Request, res: Response) => {
  await syncPriceData();

  res.json({
    message: "Price data sync initiated",
  });
});

/**
 * POST /api/perplexity/sync/news
 * Manually trigger news sync (admin only)
 */
export const syncNews = asyncHandler(async (req: Request, res: Response) => {
  await syncMarketNews();

  res.json({
    message: "News sync initiated",
  });
});

/**
 * POST /api/perplexity/sync/arbitrage
 * Manually trigger arbitrage detection (admin only)
 */
export const syncArbitrage = asyncHandler(async (req: Request, res: Response) => {
  await detectArbitrage();

  res.json({
    message: "Arbitrage detection initiated",
  });
});

/**
 * Register Perplexity routes
 */
export function registerPerplexityRoutes(app: Express) {
  app.get("/api/perplexity/prices", getPrices);
  app.get("/api/perplexity/news", getNews);
  app.get("/api/perplexity/arbitrage", getArbitrageOpportunities);
  app.get("/api/perplexity/briefing", getBriefing);
  app.post("/api/perplexity/sync/prices", requireAuth, syncPrices);
  app.post("/api/perplexity/sync/news", requireAuth, syncNews);
  app.post("/api/perplexity/sync/arbitrage", requireAuth, syncArbitrage);
}


