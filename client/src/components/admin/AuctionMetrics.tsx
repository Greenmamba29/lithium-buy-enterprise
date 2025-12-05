import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AuctionMetricsProps {
  data: {
    totalAuctions: number;
    liveAuctions: number;
    endedAuctions: number;
    totalBids: number;
    averageBidAmount: number;
    totalValue: number;
    auctionsByType: Record<string, number>;
  };
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

export function AuctionMetrics({ data }: AuctionMetricsProps) {
  const pieData = Object.entries(data.auctionsByType || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auction Metrics</CardTitle>
        <CardDescription>Live auction performance and statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Auctions</p>
                <p className="text-2xl font-bold">{data.totalAuctions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Live Now</p>
                <p className="text-2xl font-bold text-green-500">{data.liveAuctions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bids</p>
                <p className="text-2xl font-bold">{data.totalBids}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Bid</p>
                <p className="text-2xl font-bold">${data.averageBidAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {pieData.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
