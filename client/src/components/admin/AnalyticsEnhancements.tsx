import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Clock, DollarSign, Users } from "lucide-react";

/**
 * Enhanced Analytics Components for Admin Dashboard
 */

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"];

/**
 * User Growth Analytics
 */
export function UserGrowthAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "analytics", "user-growth"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/analytics/user-growth");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const chartData = data?.data?.growth || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>New users over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="newUsers" stroke="#8884d8" name="New Users" />
            <Line type="monotone" dataKey="totalUsers" stroke="#82ca9d" name="Total Users" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Revenue Analytics
 */
export function RevenueAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "analytics", "revenue"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/analytics/revenue");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const revenueData = data?.data?.revenue || [];
  const summary = data?.data?.summary || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Analytics</CardTitle>
        <CardDescription>Revenue breakdown by source</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">${summary.total?.toLocaleString() || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold">${summary.monthly?.toLocaleString() || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Growth</p>
            <p className={`text-2xl font-bold ${(summary.growth || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {summary.growth ? `${summary.growth > 0 ? "+" : ""}${summary.growth.toFixed(1)}%` : "0%"}
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="auctions" fill="#8884d8" name="Auctions" />
            <Bar dataKey="rfqs" fill="#82ca9d" name="RFQs" />
            <Bar dataKey="subscriptions" fill="#ffc658" name="Subscriptions" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Platform Activity Analytics
 */
export function PlatformActivityAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "analytics", "activity"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/analytics/activity");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const activityData = data?.data?.activity || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Activity</CardTitle>
        <CardDescription>User actions and engagement</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="logins" stroke="#8884d8" name="Logins" />
            <Line type="monotone" dataKey="searches" stroke="#82ca9d" name="Searches" />
            <Line type="monotone" dataKey="bids" stroke="#ffc658" name="Bids" />
            <Line type="monotone" dataKey="rfqs" stroke="#ff7300" name="RFQs Created" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Market Share Analytics
 */
export function MarketShareAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "analytics", "market-share"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/analytics/market-share");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const marketData = data?.data?.marketShare || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Share by Product Type</CardTitle>
        <CardDescription>Distribution of transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={marketData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {marketData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Performance Metrics
 */
export function PerformanceMetrics() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "analytics", "performance"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/analytics/performance");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const metrics = data?.data || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>System performance indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
              <p className="text-xl font-bold">{metrics.avgResponseTime || 0}ms</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">DB Query Time</p>
              <p className="text-xl font-bold">{metrics.avgDbTime || 0}ms</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-xl font-bold">{metrics.activeUsers || 0}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
              <p className="text-xl font-bold">{metrics.cacheHitRate || 0}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Comprehensive Analytics Dashboard
 */
export function AnalyticsEnhancements() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <UserGrowthAnalytics />
            <MarketShareAnalytics />
          </div>
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueAnalytics />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserGrowthAnalytics />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <PlatformActivityAnalytics />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

