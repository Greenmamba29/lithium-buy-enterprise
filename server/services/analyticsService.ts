import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { metricsCollector } from "../utils/monitoring.js";

/**
 * Enhanced Analytics Service
 * Provides detailed analytics for admin dashboard
 */

/**
 * Get user growth data
 */
export async function getUserGrowthData(days: number = 30): Promise<{
  growth: Array<{ date: string; newUsers: number; totalUsers: number }>;
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get new users per day
    const { data: users } = await supabaseAdmin
      .from("user_profiles")
      .select("created_at")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    // Group by date
    const growthMap = new Map<string, { newUsers: number; totalUsers: number }>();
    let totalUsers = 0;

    users?.forEach((user) => {
      const date = new Date(user.created_at).toISOString().split("T")[0];
      const existing = growthMap.get(date) || { newUsers: 0, totalUsers: 0 };
      existing.newUsers++;
      totalUsers++;
      existing.totalUsers = totalUsers;
      growthMap.set(date, existing);
    });

    // Convert to array
    const growth = Array.from(growthMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    return { growth };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        days,
      },
      "Failed to get user growth data"
    );
    throw error;
  }
}

/**
 * Get revenue analytics
 */
export async function getRevenueAnalyticsData(days: number = 30): Promise<{
  revenue: Array<{ period: string; auctions: number; rfqs: number; subscriptions: number }>;
  summary: { total: number; monthly: number; growth: number };
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get revenue from orders
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("total_amount, created_at, order_type")
      .gte("created_at", startDate.toISOString())
      .eq("payment_status", "paid");

    // Get revenue from escrow
    const { data: escrows } = await supabaseAdmin
      .from("escrow_accounts")
      .select("amount, created_at")
      .gte("created_at", startDate.toISOString())
      .eq("status", "released");

    // Group by period (daily)
    const revenueMap = new Map<
      string,
      { auctions: number; rfqs: number; subscriptions: number }
    >();

    orders?.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0];
      const existing = revenueMap.get(date) || { auctions: 0, rfqs: 0, subscriptions: 0 };
      const amount = parseFloat(order.total_amount || "0");

      if (order.order_type === "auction") {
        existing.auctions += amount;
      } else if (order.order_type === "rfq") {
        existing.rfqs += amount;
      } else {
        existing.subscriptions += amount;
      }

      revenueMap.set(date, existing);
    });

    escrows?.forEach((escrow) => {
      const date = new Date(escrow.created_at).toISOString().split("T")[0];
      const existing = revenueMap.get(date) || { auctions: 0, rfqs: 0, subscriptions: 0 };
      existing.auctions += parseFloat(escrow.amount || "0");
      revenueMap.set(date, existing);
    });

    const revenue = Array.from(revenueMap.entries()).map(([period, data]) => ({
      period,
      ...data,
    }));

    // Calculate summary
    const total = revenue.reduce((sum, r) => sum + r.auctions + r.rfqs + r.subscriptions, 0);
    const thisMonth = revenue
      .filter((r) => {
        const date = new Date(r.period);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, r) => sum + r.auctions + r.rfqs + r.subscriptions, 0);

    const lastMonth = revenue
      .filter((r) => {
        const date = new Date(r.period);
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        return (
          date.getMonth() === lastMonth.getMonth() &&
          date.getFullYear() === lastMonth.getFullYear()
        );
      })
      .reduce((sum, r) => sum + r.auctions + r.rfqs + r.subscriptions, 0);

    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    return {
      revenue,
      summary: {
        total,
        monthly: thisMonth,
        growth,
      },
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        days,
      },
      "Failed to get revenue analytics"
    );
    throw error;
  }
}

/**
 * Get platform activity analytics
 */
export async function getActivityAnalyticsData(hours: number = 24): Promise<{
  activity: Array<{ hour: string; logins: number; searches: number; bids: number; rfqs: number }>;
}> {
  try {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    // This would require activity logging table
    // For now, return mock data structure
    // In production, query from activity_logs table

    const activity: Array<{
      hour: string;
      logins: number;
      searches: number;
      bids: number;
      rfqs: number;
    }> = [];

    // Generate hourly data
    for (let i = hours - 1; i >= 0; i--) {
      const date = new Date();
      date.setHours(date.getHours() - i);
      const hour = date.toISOString().split("T")[1].split(":")[0] + ":00";

      // Mock data - replace with actual queries
      activity.push({
        hour,
        logins: Math.floor(Math.random() * 50),
        searches: Math.floor(Math.random() * 100),
        bids: Math.floor(Math.random() * 20),
        rfqs: Math.floor(Math.random() * 10),
      });
    }

    return { activity };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        hours,
      },
      "Failed to get activity analytics"
    );
    throw error;
  }
}

/**
 * Get market share data
 */
export async function getMarketShareData(): Promise<{
  marketShare: Array<{ name: string; value: number }>;
}> {
  try {
    // Get transactions by product type
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("order_type, total_amount")
      .eq("payment_status", "paid");

    const marketShareMap = new Map<string, number>();

    orders?.forEach((order) => {
      const type = order.order_type || "other";
      const amount = parseFloat(order.total_amount || "0");
      const existing = marketShareMap.get(type) || 0;
      marketShareMap.set(type, existing + amount);
    });

    const marketShare = Array.from(marketShareMap.entries()).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    return { marketShare };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get market share data"
    );
    throw error;
  }
}
