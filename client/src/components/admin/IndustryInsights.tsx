import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, DollarSign } from "lucide-react";

interface IndustryInsightsProps {
  insights?: any[];
  arbitrage?: {
    totalOpportunities: number;
    activeOpportunities: number;
    totalValue: number;
    averageProfitMargin: number;
    topOpportunities: any[];
  };
  news?: any[];
}

export function IndustryInsights({ insights, arbitrage, news }: IndustryInsightsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Arbitrage Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Arbitrage Opportunities
          </CardTitle>
          <CardDescription>Real-time arbitrage detection and profit analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {arbitrage ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Active Opportunities</p>
                  <p className="text-2xl font-bold">{arbitrage.activeOpportunities}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">${arbitrage.totalValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Profit Margin</p>
                  <p className="text-2xl font-bold">{arbitrage.averageProfitMargin.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Opportunities</p>
                  <p className="text-2xl font-bold">{arbitrage.totalOpportunities}</p>
                </div>
              </div>

              {arbitrage.topOpportunities && arbitrage.topOpportunities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Top Opportunities</p>
                  {arbitrage.topOpportunities.slice(0, 5).map((opp: any, index: number) => (
                    <div
                      key={opp.id || index}
                      className="flex items-center justify-between p-2 bg-stone-50 dark:bg-stone-900 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {opp.product_type} ({opp.purity_level}%)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {opp.buy_location_country} → {opp.sell_location_country}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-500">
                          ${opp.estimated_profit?.toLocaleString()}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {opp.profit_margin_percentage?.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-center py-4">No arbitrage data available</p>
          )}
        </CardContent>
      </Card>

      {/* Market News & Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Market News & Insights
          </CardTitle>
          <CardDescription>Latest industry news and market intelligence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {news && news.length > 0 ? (
            <div className="space-y-3">
              {news.slice(0, 5).map((item: any, index: number) => (
                <div key={item.id || index} className="border-b pb-3 last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.source_name} • {new Date(item.published_at).toLocaleDateString()}
                      </p>
                    </div>
                    {item.sentiment_label && (
                      <Badge
                        variant={
                          item.sentiment_label === "positive"
                            ? "default"
                            : item.sentiment_label === "negative"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {item.sentiment_label}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No news available</p>
          )}

          {insights && insights.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-semibold mb-2">Industry Insights</p>
              <div className="space-y-2">
                {insights.slice(0, 3).map((insight: any, index: number) => (
                  <div key={insight.id || index} className="text-sm">
                    <p className="font-medium">{insight.title}</p>
                    <p className="text-muted-foreground text-xs line-clamp-2">{insight.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
