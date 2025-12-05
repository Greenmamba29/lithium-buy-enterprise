import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import {
  getKPIs,
  getPriceIntelligenceData,
  getAuctionMetrics,
  getProcurementStats,
  getArbitrageSummary,
  getUserEngagementMetrics,
  getRevenueForecast,
} from "./adminAnalytics.js";

/**
 * Dashboard Service
 * Aggregates data for the admin dashboard
 */

/**
 * Get complete dashboard data
 */
export async function getDashboardData(): Promise<{
  kpis: any;
  priceIntelligence: any;
  auctionMetrics: any;
  procurementStats: any;
  arbitrageSummary: any;
  userEngagement: any;
  revenueForecast: any;
}> {
  try {
    const [
      kpis,
      priceIntelligence,
      auctionMetrics,
      procurementStats,
      arbitrageSummary,
      userEngagement,
      revenueForecast,
    ] = await Promise.all([
      getKPIs(),
      getPriceIntelligenceData(90),
      getAuctionMetrics(),
      getProcurementStats(),
      getArbitrageSummary(),
      getUserEngagementMetrics(),
      getRevenueForecast(24),
    ]);

    return {
      kpis,
      priceIntelligence,
      auctionMetrics,
      procurementStats,
      arbitrageSummary,
      userEngagement,
      revenueForecast,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get dashboard data"
    );
    throw error;
  }
}

/**
 * Get industry insights for dashboard
 */
export async function getIndustryInsights(limit = 10): Promise<any[]> {
  try {
    const { data: insights, error } = await supabaseAdmin
      .from("industry_insights")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch insights: ${error.message}`);
    }

    return insights || [];
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get industry insights"
    );
    throw error;
  }
}

/**
 * Get recent market news
 */
export async function getRecentMarketNews(limit = 5): Promise<any[]> {
  try {
    const { data: news, error } = await supabaseAdmin
      .from("market_news")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch news: ${error.message}`);
    }

    return news || [];
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get recent market news"
    );
    throw error;
  }
}
