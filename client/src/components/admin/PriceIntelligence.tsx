import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PriceIntelligenceProps {
  data: {
    currentPrice: number;
    priceChange24h: number;
    priceChangePercent24h: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    priceHistory: Array<{ date: string; price: number }>;
  };
}

export function PriceIntelligence({ data }: PriceIntelligenceProps) {
  const isPositive = data.priceChange24h >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Intelligence</CardTitle>
        <CardDescription>Real-time lithium price trends and market data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-2xl font-bold">${data.currentPrice.toLocaleString()}/ton</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">24h Change</p>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <p
                className={`text-xl font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}
              >
                {isPositive ? "+" : ""}
                {data.priceChangePercent24h.toFixed(2)}%
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average (90d)</p>
            <p className="text-xl font-semibold">${data.averagePrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Range</p>
            <p className="text-sm">
              ${data.minPrice.toLocaleString()} - ${data.maxPrice.toLocaleString()}
            </p>
          </div>
        </div>

        {data.priceHistory && data.priceHistory.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.priceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
