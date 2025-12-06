import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Building2, Gavel, FileText, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { PriceIntelligence } from "@/components/admin/PriceIntelligence";
import { AuctionMetrics } from "@/components/admin/AuctionMetrics";
import { ProcurementStats } from "@/components/admin/ProcurementStats";
import { IndustryInsights } from "@/components/admin/IndustryInsights";
import { AnalyticsEnhancements } from "@/components/admin/AnalyticsEnhancements";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/dashboard");
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const dashboard = data?.data;

  return (
    <ProtectedRoute requiredRole={["admin"]}>
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time platform analytics and market intelligence
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive">Failed to load dashboard data. Please try again.</p>
              </CardContent>
            </Card>
          ) : dashboard ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboard.kpis?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboard.kpis?.totalSuppliers || 0} suppliers
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Auctions</CardTitle>
                    <Gavel className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboard.kpis?.activeAuctions || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboard.kpis?.totalAuctions || 0} total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open RFQs</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboard.kpis?.openRFQs || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboard.kpis?.totalRFQs || 0} total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${(dashboard.kpis?.totalRevenue || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboard.kpis?.totalTransactions || 0} transactions
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Price Intelligence */}
              <PriceIntelligence data={dashboard.priceIntelligence} />

              {/* Auction Metrics */}
              <AuctionMetrics data={dashboard.auctionMetrics} />

              {/* Procurement Stats */}
              <ProcurementStats data={dashboard.procurementStats} />

              {/* Industry Insights */}
              <IndustryInsights
                insights={dashboard.insights}
                arbitrage={dashboard.arbitrageSummary}
                news={dashboard.news}
              />

              {/* Enhanced Analytics */}
              <AnalyticsEnhancements />
            </>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}
