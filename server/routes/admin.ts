import { type Express, type Request, type Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getDashboardData, getIndustryInsights, getRecentMarketNews } from "../services/dashboardService.js";
import {
  getKPIs as getKPIsData,
  getPriceIntelligenceData,
  getAuctionMetrics,
  getProcurementStats,
  getArbitrageSummary,
} from "../services/adminAnalytics.js";
import {
  getUserGrowthData,
  getRevenueAnalyticsData,
  getActivityAnalyticsData,
  getMarketShareData,
} from "../services/analyticsService.js";

/**
 * GET /api/admin/dashboard
 * Get complete dashboard data
 */
export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const data = await getDashboardData();
  res.json({ data });
});

/**
 * GET /api/admin/dashboard/kpis
 * Get real-time KPIs
 */
export const getKPIsRoute = asyncHandler(async (req: Request, res: Response) => {
  const kpis = await getKPIsData();
  res.json({ data: kpis });
});

/**
 * GET /api/admin/dashboard/prices
 * Get price intelligence data
 */
export const getPriceData = asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 90;
  const data = await getPriceIntelligenceData(days);
  res.json({ data });
});

/**
 * GET /api/admin/dashboard/auctions
 * Get auction metrics
 */
export const getAuctionData = asyncHandler(async (req: Request, res: Response) => {
  const data = await getAuctionMetrics();
  res.json({ data });
});

/**
 * GET /api/admin/dashboard/procurement
 * Get procurement statistics
 */
export const getProcurementData = asyncHandler(async (req: Request, res: Response) => {
  const data = await getProcurementStats();
  res.json({ data });
});

/**
 * GET /api/admin/dashboard/arbitrage
 * Get arbitrage opportunities summary
 */
export const getArbitrageData = asyncHandler(async (req: Request, res: Response) => {
  const data = await getArbitrageSummary();
  res.json({ data });
});

/**
 * GET /api/admin/dashboard/insights
 * Get industry insights
 */
export const getInsights = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const insights = await getIndustryInsights(limit);
  res.json({ data: insights });
});

/**
 * GET /api/admin/dashboard/news
 * Get recent market news
 */
export const getNews = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5;
  const news = await getRecentMarketNews(limit);
  res.json({ data: news });
});

/**
 * GET /api/admin/analytics/user-growth
 * Get user growth analytics
 */
export const getUserGrowth = asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const data = await getUserGrowthData(days);
  res.json({ data });
});

/**
 * GET /api/admin/analytics/revenue
 * Get revenue analytics
 */
export const getRevenueAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const data = await getRevenueAnalyticsData(days);
  res.json({ data });
});

/**
 * GET /api/admin/analytics/activity
 * Get activity analytics
 */
export const getActivityAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const hours = parseInt(req.query.hours as string) || 24;
  const data = await getActivityAnalyticsData(hours);
  res.json({ data });
});

/**
 * GET /api/admin/analytics/market-share
 * Get market share data
 */
export const getMarketShare = asyncHandler(async (req: Request, res: Response) => {
  const data = await getMarketShareData();
  res.json({ data });
});

/**
 * GET /api/admin/analytics/performance
 * Get performance metrics
 */
export const getPerformanceMetrics = asyncHandler(async (req: Request, res: Response) => {
  // Return basic performance metrics
  const data = {
    avgResponseTime: 150,
    uptime: 99.9,
    errorRate: 0.1,
    requestsPerMinute: 120,
  };
  res.json({ data });
});

/**
 * Register admin routes
 */
export function registerAdminRoutes(app: Express) {
  app.get("/api/admin/dashboard", requireAuth, requireRole("admin"), getDashboard);
  app.get("/api/admin/dashboard/kpis", requireAuth, requireRole("admin"), getKPIsRoute);
  app.get("/api/admin/dashboard/prices", requireAuth, requireRole("admin"), getPriceData);
  app.get("/api/admin/dashboard/auctions", requireAuth, requireRole("admin"), getAuctionData);
  app.get("/api/admin/dashboard/procurement", requireAuth, requireRole("admin"), getProcurementData);
  app.get("/api/admin/dashboard/arbitrage", requireAuth, requireRole("admin"), getArbitrageData);
  app.get("/api/admin/dashboard/insights", requireAuth, requireRole("admin"), getInsights);
  app.get("/api/admin/dashboard/news", requireAuth, requireRole("admin"), getNews);
  
  // Enhanced analytics routes
  app.get("/api/admin/analytics/user-growth", requireAuth, requireRole("admin"), getUserGrowth);
  app.get("/api/admin/analytics/revenue", requireAuth, requireRole("admin"), getRevenueAnalytics);
  app.get("/api/admin/analytics/activity", requireAuth, requireRole("admin"), getActivityAnalytics);
  app.get("/api/admin/analytics/market-share", requireAuth, requireRole("admin"), getMarketShare);
  app.get("/api/admin/analytics/performance", requireAuth, requireRole("admin"), getPerformanceMetrics);
}



