import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { metricsCollector } from "../utils/monitoring.js";

/**
 * Admin Analytics Service
 * Provides KPIs and analytics for the admin dashboard
 */

/**
 * Get real-time KPIs
 */
export async function getKPIs(): Promise<{
  totalUsers: number;
  totalSuppliers: number;
  totalAuctions: number;
  activeAuctions: number;
  totalRFQs: number;
  openRFQs: number;
  totalRevenue: number;
  totalTransactions: number;
}> {
  try {
    // Get user count
    const { count: userCount } = await supabaseAdmin
      .from("user_profiles")
      .select("*", { count: "exact", head: true });

    // Get supplier count
    const { count: supplierCount } = await supabaseAdmin
      .from("suppliers")
      .select("*", { count: "exact", head: true });

    // Get auction stats
    const { count: totalAuctions } = await supabaseAdmin
      .from("auctions")
      .select("*", { count: "exact", head: true });

    const { count: activeAuctions } = await supabaseAdmin
      .from("auctions")
      .select("*", { count: "exact", head: true })
      .in("status", ["scheduled", "live"]);

    // Get RFQ stats
    const { count: totalRFQs } = await supabaseAdmin
      .from("rfqs")
      .select("*", { count: "exact", head: true });

    const { count: openRFQs } = await supabaseAdmin
      .from("rfqs")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    // Get revenue (from orders and escrow)
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("total_amount, currency")
      .eq("payment_status", "paid");

    const { data: escrows } = await supabaseAdmin
      .from("escrow_accounts")
      .select("amount, currency")
      .eq("status", "released");

    const totalRevenue =
      (orders?.reduce((sum, o) => sum + parseFloat(o.total_amount || "0"), 0) || 0) +
      (escrows?.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0) || 0);

    // Get transaction count
    const { count: transactionCount } = await supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("payment_status", "paid");

    return {
      totalUsers: userCount || 0,
      totalSuppliers: supplierCount || 0,
      totalAuctions: totalAuctions || 0,
      activeAuctions: activeAuctions || 0,
      totalRFQs: totalRFQs || 0,
      openRFQs: openRFQs || 0,
      totalRevenue,
      totalTransactions: transactionCount || 0,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get KPIs"
    );
    throw error;
  }
}

/**
 * Get price intelligence data for dashboard
 */
export async function getPriceIntelligenceData(days = 90): Promise<{
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceHistory: Array<{ date: string; price: number }>;
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get recent price data
    const { data: priceData, error } = await supabaseAdmin
      .from("price_data")
      .select("price_per_unit, timestamp")
      .gte("timestamp", startDate.toISOString())
      .order("timestamp", { ascending: false })
      .limit(1000);

    if (error) {
      throw new Error(`Failed to fetch price data: ${error.message}`);
    }

    if (!priceData || priceData.length === 0) {
      return {
        currentPrice: 0,
        priceChange24h: 0,
        priceChangePercent24h: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        priceHistory: [],
      };
    }

    const prices = priceData.map((p) => parseFloat(p.price_per_unit));
    const currentPrice = prices[0] || 0;
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Calculate 24h change
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const price24hAgo = priceData.find(
      (p) => new Date(p.timestamp) <= oneDayAgo
    )?.price_per_unit;

    const priceChange24h = price24hAgo
      ? currentPrice - parseFloat(price24hAgo)
      : 0;
    const priceChangePercent24h = price24hAgo
      ? (priceChange24h / parseFloat(price24hAgo)) * 100
      : 0;

    // Group by date for history
    const priceHistoryMap = new Map<string, number[]>();
    priceData.forEach((p) => {
      const date = new Date(p.timestamp).toISOString().split("T")[0];
      if (!priceHistoryMap.has(date)) {
        priceHistoryMap.set(date, []);
      }
      priceHistoryMap.get(date)!.push(parseFloat(p.price_per_unit));
    });

    const priceHistory = Array.from(priceHistoryMap.entries())
      .map(([date, prices]) => ({
        date,
        price: prices.reduce((a, b) => a + b, 0) / prices.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      currentPrice,
      priceChange24h,
      priceChangePercent24h,
      averagePrice,
      minPrice,
      maxPrice,
      priceHistory,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get price intelligence data"
    );
    throw error;
  }
}

/**
 * Get auction metrics
 */
/**
 * Get auction metrics with PRD-specific KPIs
 * PRD Metrics: GMV, fill rate, bid velocity, auction success rate
 */
export async function getAuctionMetrics(): Promise<{
  totalAuctions: number;
  liveAuctions: number;
  endedAuctions: number;
  totalBids: number;
  averageBidAmount: number;
  totalValue: number;
  auctionsByType: Record<string, number>;
  // PRD-specific metrics
  gmv: number; // Gross Merchandise Value
  fillRate: number; // Percentage of auctions with ≥1 bid
  bidVelocity: number; // Bids per minute
  auctionSuccessRate: number; // Percentage of auctions with ≥1 bid
  averageBidsPerAuction: number;
  uniqueBuyers: number;
  sellerRepeatRate: number; // Percentage of sellers with multiple auctions
}> {
  try {
    const { data: auctions, error: auctionError } = await supabaseAdmin
      .from("auctions")
      .select("id, auction_type, status, current_bid, starting_price, final_price, quantity_total, currency, seller_id, scheduled_start, scheduled_end");

    if (auctionError) {
      throw new Error(`Failed to fetch auctions: ${auctionError.message}`);
    }

    const { data: bids, error: bidError } = await supabaseAdmin
      .from("bids")
      .select("id, auction_id, bidder_id, amount, currency, created_at")
      .eq("is_retracted", false);

    if (bidError) {
      logger.warn({ error: bidError.message }, "Failed to fetch bids");
    }

    const { data: closedAuctions } = await supabaseAdmin
      .from("auctions")
      .select("id, final_price, quantity_total")
      .in("status", ["closed", "completed"])
      .not("final_price", "is", null);

    const totalAuctions = auctions?.length || 0;
    const liveAuctions = auctions?.filter((a) => a.status === "active").length || 0;
    const endedAuctions = auctions?.filter((a) => a.status === "closed" || a.status === "completed").length || 0;
    const totalBids = bids?.length || 0;
    const averageBidAmount =
      bids && bids.length > 0
        ? bids.reduce((sum, b) => sum + parseFloat(b.amount || "0"), 0) / bids.length
        : 0;

    const totalValue =
      auctions?.reduce((sum, a) => sum + parseFloat(a.current_bid || a.starting_price || "0"), 0) || 0;

    const auctionsByType: Record<string, number> = {};
    auctions?.forEach((a) => {
      auctionsByType[a.auction_type] = (auctionsByType[a.auction_type] || 0) + 1;
    });

    // PRD: Calculate GMV (Gross Merchandise Value)
    // GMV = sum of (final_price * quantity_total) for closed/completed auctions
    const gmv = closedAuctions?.reduce((sum, a) => {
      const price = parseFloat(a.final_price || "0");
      const quantity = parseFloat(a.quantity_total || "0");
      return sum + price * quantity;
    }, 0) || 0;

    // PRD: Calculate fill rate (auctions with ≥1 bid)
    const auctionsWithBids = new Set(bids?.map((b) => b.auction_id) || []);
    const fillRate = endedAuctions > 0 ? (auctionsWithBids.size / endedAuctions) * 100 : 0;

    // PRD: Calculate bid velocity (bids per minute)
    // Get bids from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentBids = bids?.filter((b) => new Date(b.created_at) >= oneDayAgo) || [];
    const minutesInDay = 24 * 60;
    const bidVelocity = recentBids.length / minutesInDay;

    // PRD: Auction success rate (auctions with ≥1 bid)
    const auctionSuccessRate = totalAuctions > 0 ? (auctionsWithBids.size / totalAuctions) * 100 : 0;

    // Average bids per auction
    const averageBidsPerAuction = totalAuctions > 0 ? totalBids / totalAuctions : 0;

    // Unique buyers
    const uniqueBuyers = new Set(bids?.map((b) => b.bidder_id) || []).size;

    // Seller repeat rate (sellers with multiple auctions)
    const sellerAuctionCounts = new Map<string, number>();
    auctions?.forEach((a) => {
      if (a.seller_id) {
        sellerAuctionCounts.set(a.seller_id, (sellerAuctionCounts.get(a.seller_id) || 0) + 1);
      }
    });
    const sellersWithMultipleAuctions = Array.from(sellerAuctionCounts.values()).filter((count) => count > 1).length;
    const totalSellers = sellerAuctionCounts.size;
    const sellerRepeatRate = totalSellers > 0 ? (sellersWithMultipleAuctions / totalSellers) * 100 : 0;

    return {
      totalAuctions,
      liveAuctions,
      endedAuctions,
      totalBids,
      averageBidAmount,
      totalValue,
      auctionsByType,
      // PRD metrics
      gmv,
      fillRate,
      bidVelocity,
      auctionSuccessRate,
      averageBidsPerAuction,
      uniqueBuyers,
      sellerRepeatRate,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get auction metrics"
    );
    throw error;
  }
}

/**
 * Get live auction count (PRD: for admin monitoring)
 */
export async function getLiveAuctionCount(): Promise<number> {
  try {
    const { count, error } = await supabaseAdmin
      .from("auctions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    if (error) {
      throw new Error(`Failed to fetch live auctions: ${error.message}`);
    }

    return count || 0;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get live auction count"
    );
    throw error;
  }
}

/**
 * Get flagged auctions (for anti-manipulation monitoring)
 */
export async function getFlaggedAuctions(): Promise<any[]> {
  try {
    // Get auctions with verification_status = 'flagged'
    const { data, error } = await supabaseAdmin
      .from("auctions")
      .select("*")
      .eq("verification_status", "flagged")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch flagged auctions: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get flagged auctions"
    );
    throw error;
  }
}

/**
 * Get user management stats (KYC pending, user counts)
 */
export async function getUserManagementStats(): Promise<{
  totalUsers: number;
  kycPending: number;
  kycApproved: number;
  kycRejected: number;
  suppliers: number;
  buyers: number;
}> {
  try {
    const { count: totalUsers } = await supabaseAdmin
      .from("user_profiles")
      .select("*", { count: "exact", head: true });

    const { count: kycPending } = await supabaseAdmin
      .from("kyc_verifications")
      .select("*", { count: "exact", head: true })
      .eq("kyc_status", "pending");

    const { count: kycApproved } = await supabaseAdmin
      .from("kyc_verifications")
      .select("*", { count: "exact", head: true })
      .eq("kyc_status", "approved");

    const { count: kycRejected } = await supabaseAdmin
      .from("kyc_verifications")
      .select("*", { count: "exact", head: true })
      .eq("kyc_status", "rejected");

    const { count: suppliers } = await supabaseAdmin
      .from("suppliers")
      .select("*", { count: "exact", head: true });

    // Buyers are users who have placed bids
    const { data: buyers } = await supabaseAdmin
      .from("bids")
      .select("bidder_id")
      .limit(1000);

    const uniqueBuyers = new Set(buyers?.map((b) => b.bidder_id) || []).size;

    return {
      totalUsers: totalUsers || 0,
      kycPending: kycPending || 0,
      kycApproved: kycApproved || 0,
      kycRejected: kycRejected || 0,
      suppliers: suppliers || 0,
      buyers: uniqueBuyers,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get user management stats"
    );
    throw error;
  }
}

/**
 * Get procurement statistics
 */
export async function getProcurementStats(): Promise<{
  totalRFQs: number;
  publishedRFQs: number;
  awardedRFQs: number;
  totalResponses: number;
  averageResponseTime: number;
  totalContractValue: number;
}> {
  try {
    const { data: rfqs, error: rfqError } = await supabaseAdmin
      .from("rfqs")
      .select("id, status");

    if (rfqError) {
      throw new Error(`Failed to fetch RFQs: ${rfqError.message}`);
    }

    const { data: responses, error: responseError } = await supabaseAdmin
      .from("rfq_responses")
      .select("id, created_at, rfq_id");

    if (responseError) {
      logger.warn({ error: responseError.message }, "Failed to fetch responses");
    }

    const { data: contracts, error: contractError } = await supabaseAdmin
      .from("contracts")
      .select("content")
      .eq("status", "active");

    if (contractError) {
      logger.warn({ error: contractError.message }, "Failed to fetch contracts");
    }

    const totalRFQs = rfqs?.length || 0;
    const publishedRFQs = rfqs?.filter((r) => r.status === "published").length || 0;
    const awardedRFQs = rfqs?.filter((r) => r.status === "awarded").length || 0;
    const totalResponses = responses?.length || 0;

    // Calculate average response time (simplified)
    const averageResponseTime = totalResponses > 0 ? 24 : 0; // Placeholder

    // Calculate total contract value
    const totalContractValue =
      contracts?.reduce((sum, c) => {
        const price = (c.content as any)?.price || 0;
        const quantity = (c.content as any)?.quantity || 0;
        return sum + price * quantity;
      }, 0) || 0;

    return {
      totalRFQs,
      publishedRFQs,
      awardedRFQs,
      totalResponses,
      averageResponseTime,
      totalContractValue,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get procurement stats"
    );
    throw error;
  }
}

/**
 * Get arbitrage opportunities summary
 */
export async function getArbitrageSummary(): Promise<{
  totalOpportunities: number;
  activeOpportunities: number;
  totalValue: number;
  averageProfitMargin: number;
  topOpportunities: any[];
}> {
  try {
    const { data: opportunities, error } = await supabaseAdmin
      .from("arbitrage_opportunities")
      .select("*")
      .eq("status", "active")
      .order("estimated_profit", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch arbitrage opportunities: ${error.message}`);
    }

    const totalOpportunities = opportunities?.length || 0;
    const activeOpportunities = opportunities?.filter((o) => o.status === "active").length || 0;
    const totalValue =
      opportunities?.reduce((sum, o) => sum + parseFloat(o.estimated_profit || "0"), 0) || 0;
    const averageProfitMargin =
      opportunities && opportunities.length > 0
        ? opportunities.reduce((sum, o) => sum + parseFloat(o.profit_margin_percentage || "0"), 0) /
          opportunities.length
        : 0;

    const topOpportunities = (opportunities || []).slice(0, 10);

    return {
      totalOpportunities,
      activeOpportunities,
      totalValue,
      averageProfitMargin,
      topOpportunities,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get arbitrage summary"
    );
    throw error;
  }
}

/**
 * Get user engagement metrics
 */
export async function getUserEngagementMetrics(): Promise<{
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  averageSessionTime: number;
  topCountries: Array<{ country: string; count: number }>;
}> {
  try {
    // Get user counts (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { count: totalUsers } = await supabaseAdmin
      .from("user_profiles")
      .select("*", { count: "exact", head: true });

    const { count: newUsers } = await supabaseAdmin
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Get active users (users with activity in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { count: activeUsers } = await supabaseAdmin
      .from("orders")
      .select("user_id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString());

    // Calculate growth (simplified)
    const userGrowth = totalUsers && totalUsers > 0 ? (newUsers || 0) / totalUsers : 0;

    // Placeholder for session time (would come from analytics)
    const averageSessionTime = 15; // minutes

    // Get top countries from locations
    const { data: locations } = await supabaseAdmin
      .from("locations")
      .select("country");

    const countryCounts = new Map<string, number>();
    locations?.forEach((loc) => {
      if (loc.country) {
        countryCounts.set(loc.country, (countryCounts.get(loc.country) || 0) + 1);
      }
    });

    const topCountries = Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      activeUsers: activeUsers || 0,
      newUsers: newUsers || 0,
      userGrowth: userGrowth * 100, // Percentage
      averageSessionTime,
      topCountries,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get user engagement metrics"
    );
    throw error;
  }
}

/**
 * Get revenue forecast
 */
export async function getRevenueForecast(months = 24): Promise<
  Array<{
    month: string;
    projectedRevenue: number;
    confidence: number;
  }>
> {
  try {
    // Get historical revenue data
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("total_amount, created_at")
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false })
      .limit(100);

    // Calculate average monthly revenue
    const monthlyRevenue = new Map<string, number>();
    orders?.forEach((order) => {
      const month = new Date(order.created_at).toISOString().slice(0, 7); // YYYY-MM
      monthlyRevenue.set(
        month,
        (monthlyRevenue.get(month) || 0) + parseFloat(order.total_amount || "0")
      );
    });

    const avgMonthlyRevenue =
      monthlyRevenue.size > 0
        ? Array.from(monthlyRevenue.values()).reduce((a, b) => a + b, 0) / monthlyRevenue.size
        : 0;

    // Generate forecast (simplified linear growth)
    const forecast = [];
    const startDate = new Date();
    const growthRate = 0.15; // 15% monthly growth

    for (let i = 1; i <= months; i++) {
      const monthDate = new Date(startDate);
      monthDate.setMonth(monthDate.getMonth() + i);
      const month = monthDate.toISOString().slice(0, 7);

      const projectedRevenue = avgMonthlyRevenue * Math.pow(1 + growthRate, i);
      const confidence = Math.max(50, 100 - i * 2); // Decreasing confidence over time

      forecast.push({
        month,
        projectedRevenue,
        confidence,
      });
    }

    return forecast;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get revenue forecast"
    );
    throw error;
  }
}
