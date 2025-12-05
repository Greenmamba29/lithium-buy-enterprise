import { addJob } from "./queue.js";
import {
  fetchLithiumPrices,
  analyzeNewsSentiment,
  detectArbitrageOpportunities,
  generateDailyBriefing,
  storePriceData,
  storeArbitrageOpportunities,
} from "../services/perplexityService.js";
import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";

/**
 * Perplexity Data Sync Jobs
 * 
 * Background jobs for syncing real-time data from Perplexity Labs
 */

/**
 * Sync price data (runs every 30 seconds)
 */
export async function syncPriceData(): Promise<void> {
  try {
    logger.info({ job: "syncPriceData" }, "Starting price data sync");

    // Fetch prices for all product types and purity levels
    const productTypes: Array<"raw" | "compound" | "processed"> = ["raw", "compound", "processed"];
    const purityLevels: Array<"99" | "99.5" | "99.9"> = ["99", "99.5", "99.9"];

    const allPrices = [];

    for (const productType of productTypes) {
      for (const purityLevel of purityLevels) {
        try {
          const prices = await fetchLithiumPrices({
            productType,
            purityLevel,
          });
          allPrices.push(...prices);
        } catch (error) {
          logger.warn(
            {
              productType,
              purityLevel,
              error: error instanceof Error ? error.message : String(error),
            },
            "Failed to fetch prices for specific product/purity"
          );
        }
      }
    }

    if (allPrices.length > 0) {
      await storePriceData(allPrices);
      logger.info({ count: allPrices.length }, "Price data sync completed");
    } else {
      logger.warn("No price data fetched");
    }
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Price data sync failed"
    );
    throw error;
  }
}

/**
 * Aggregate and analyze market news (runs every 15 minutes)
 */
export async function syncMarketNews(): Promise<void> {
  try {
    logger.info({ job: "syncMarketNews" }, "Starting market news sync");

    // Fetch recent news from various sources
    // In a real implementation, this would fetch from news APIs
    // For now, we'll use Perplexity to get recent lithium news

    const { apiKey, model, baseUrl } = {
      apiKey: process.env.PERPLEXITY_API_KEY,
      model: process.env.PERPLEXITY_MODEL || "sonar-pro",
      baseUrl: "https://api.perplexity.ai",
    };

    if (!apiKey) {
      throw new Error("PERPLEXITY_API_KEY not configured");
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a news aggregator. Return structured news data in JSON format.",
          },
          {
            role: "user",
            content: "Get the latest 10 news articles about lithium market, supply chain, and industry developments from the last 24 hours. Return as JSON array with: title, content (summary), url, source, published_at (ISO date), keywords (array), categories (array).",
          },
        ],
        temperature: 0.2,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      logger.warn("No news content returned");
      return;
    }

    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    const newsItems = JSON.parse(jsonContent);

    if (!Array.isArray(newsItems)) {
      logger.warn("News items not in expected format");
      return;
    }

    // Analyze sentiment for each news item
    const analyzedNews = await analyzeNewsSentiment(newsItems);

    // Store in database
    const records = analyzedNews.map((news) => ({
      title: news.title,
      content: news.content,
      source_url: news.url,
      source_name: news.source || "Unknown",
      published_at: news.published_at || new Date().toISOString(),
      sentiment_score: news.sentiment_score,
      sentiment_label: news.sentiment_label,
      relevance_score: 50, // Default relevance
      keywords: [],
      categories: [],
      geographic_regions: [],
    }));

    const { error } = await supabaseAdmin.from("market_news").insert(records);

    if (error) {
      throw new Error(`Failed to store market news: ${error.message}`);
    }

    logger.info({ count: records.length }, "Market news sync completed");
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Market news sync failed"
    );
    throw error;
  }
}

/**
 * Detect arbitrage opportunities (runs every 60 seconds)
 */
export async function detectArbitrage(): Promise<void> {
  try {
    logger.info({ job: "detectArbitrage" }, "Starting arbitrage detection");

    // Get recent price data (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const { data: priceData, error } = await supabaseAdmin
      .from("price_data")
      .select("*")
      .gte("timestamp", oneHourAgo.toISOString())
      .order("timestamp", { ascending: false })
      .limit(1000);

    if (error) {
      throw new Error(`Failed to fetch price data: ${error.message}`);
    }

    if (!priceData || priceData.length < 2) {
      logger.info("Insufficient price data for arbitrage detection");
      return;
    }

    // Convert to PerplexityPriceData format
    const prices = priceData.map((p: any) => ({
      product_type: p.product_type,
      purity_level: p.purity_level,
      price: parseFloat(p.price_per_unit),
      currency: p.currency,
      location: {
        country: p.location_country || undefined,
        city: p.location_city || undefined,
      },
      source: p.source,
      timestamp: new Date(p.timestamp),
    }));

    // Detect opportunities
    const opportunities = await detectArbitrageOpportunities(prices);

    if (opportunities.length > 0) {
      // Mark old opportunities as expired
      await supabaseAdmin
        .from("arbitrage_opportunities")
        .update({ status: "expired" })
        .eq("status", "active")
        .lt("expires_at", new Date().toISOString());

      // Store new opportunities
      await storeArbitrageOpportunities(opportunities);
      logger.info({ count: opportunities.length }, "Arbitrage detection completed");
    } else {
      logger.info("No arbitrage opportunities detected");
    }
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Arbitrage detection failed"
    );
    throw error;
  }
}

/**
 * Generate daily market briefing (runs at 6 AM EST)
 */
export async function generateDailyBriefingJob(): Promise<void> {
  try {
    logger.info({ job: "generateDailyBriefing" }, "Starting daily briefing generation");

    const briefing = await generateDailyBriefing();

    // Store in database
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { error } = await supabaseAdmin
      .from("market_briefings")
      .upsert(
        {
          briefing_date: today.toISOString().split("T")[0],
          briefing_time: new Date().toISOString(),
          summary: briefing.summary,
          key_highlights: briefing.key_highlights,
          price_summary: briefing.price_summary,
          news_summary: briefing.news_summary,
          arbitrage_opportunities: briefing.arbitrage_opportunities,
          generated_by: "perplexity_ai",
        },
        {
          onConflict: "briefing_date",
        }
      );

    if (error) {
      throw new Error(`Failed to store daily briefing: ${error.message}`);
    }

    logger.info("Daily briefing generation completed");
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Daily briefing generation failed"
    );
    throw error;
  }
}

/**
 * Market trend analysis (runs hourly)
 */
export async function analyzeMarketTrends(): Promise<void> {
  try {
    logger.info({ job: "analyzeMarketTrends" }, "Starting market trend analysis");

    // Get price data for last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const { data: priceData, error } = await supabaseAdmin
      .from("price_data")
      .select("*")
      .gte("timestamp", sevenDaysAgo.toISOString())
      .order("timestamp", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch price data: ${error.message}`);
    }

    if (!priceData || priceData.length === 0) {
      logger.info("No price data available for trend analysis");
      return;
    }

    // Group by product type and purity
    const trends: Record<string, any> = {};

    for (const price of priceData) {
      const key = `${price.product_type}-${price.purity_level}`;
      if (!trends[key]) {
        trends[key] = {
          prices: [],
          locations: new Set(),
        };
      }
      trends[key].prices.push({
        price: parseFloat(price.price_per_unit),
        timestamp: new Date(price.timestamp),
      });
      if (price.location_country) {
        trends[key].locations.add(price.location_country);
      }
    }

    // Generate insights
    const insights = [];

    for (const [key, trend] of Object.entries(trends)) {
      const [productType, purityLevel] = key.split("-");
      const prices = trend.prices.map((p: any) => p.price);
      const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceChange = prices[prices.length - 1] - prices[0];
      const priceChangePercent = (priceChange / prices[0]) * 100;

      insights.push({
        insight_type: "price_trend",
        title: `${productType} Lithium (${purityLevel}% purity) Price Trend`,
        summary: `Average price: $${avgPrice.toFixed(2)}/ton. ${priceChangePercent > 0 ? "Increased" : "Decreased"} by ${Math.abs(priceChangePercent).toFixed(2)}% over 7 days.`,
        content: {
          product_type: productType,
          purity_level: purityLevel,
          average_price: avgPrice,
          min_price: minPrice,
          max_price: maxPrice,
          price_change: priceChange,
          price_change_percent: priceChangePercent,
          locations: Array.from(trend.locations),
        },
        confidence_level: 75,
        impact_level: Math.abs(priceChangePercent) > 10 ? "high" : Math.abs(priceChangePercent) > 5 ? "medium" : "low",
        relevant_product_types: [productType],
      });
    }

    // Store insights
    if (insights.length > 0) {
      const { error: insertError } = await supabaseAdmin.from("industry_insights").insert(insights);

      if (insertError) {
        throw new Error(`Failed to store insights: ${insertError.message}`);
      }

      logger.info({ count: insights.length }, "Market trend analysis completed");
    }
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Market trend analysis failed"
    );
    throw error;
  }
}

/**
 * Schedule all Perplexity sync jobs
 */
export function schedulePerplexityJobs(): void {
  // Price sync every 30 seconds
  addJob("perplexity-price-sync", syncPriceData, {
    repeat: {
      every: 30000, // 30 seconds
    },
  });

  // News aggregation every 15 minutes
  addJob("perplexity-news-sync", syncMarketNews, {
    repeat: {
      every: 15 * 60 * 1000, // 15 minutes
    },
  });

  // Arbitrage detection every 60 seconds
  addJob("perplexity-arbitrage", detectArbitrage, {
    repeat: {
      every: 60000, // 60 seconds
    },
  });

  // Daily briefing at 6 AM EST (11 AM UTC)
  addJob("perplexity-daily-briefing", generateDailyBriefingJob, {
    repeat: {
      pattern: "0 11 * * *", // Cron: 11 AM UTC = 6 AM EST
    },
  });

  // Market trend analysis hourly
  addJob("perplexity-trend-analysis", analyzeMarketTrends, {
    repeat: {
      every: 60 * 60 * 1000, // 1 hour
    },
  });

  logger.info("Scheduled all Perplexity data sync jobs");
}


