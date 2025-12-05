import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface ArbitrageAlert {
  id: string;
  product_type: "raw" | "compound" | "processed";
  purity_level: "99" | "99.5" | "99.9";
  buy_location: { country: string; city?: string };
  buy_price: number;
  sell_location: { country: string; city?: string };
  sell_price: number;
  estimated_profit: number;
  profit_margin: number;
  detected_at: string;
}

/**
 * Hook to subscribe to real-time arbitrage alerts
 */
export function useArbitrageAlerts(filters?: {
  minProfit?: number;
  minMargin?: number;
  productType?: "raw" | "compound" | "processed";
}) {
  return useQuery({
    queryKey: ["arbitrage-alerts", filters],
    queryFn: async (): Promise<{ data: ArbitrageAlert[] }> => {
      const params = new URLSearchParams();
      if (filters?.minProfit) params.append("minProfit", filters.minProfit.toString());
      if (filters?.minMargin) params.append("minMargin", filters.minMargin.toString());
      if (filters?.productType) params.append("productType", filters.productType);

      const res = await apiRequest("GET", `/api/intelligence/arbitrage/alerts?${params.toString()}`);
      return res.json();
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000,
  });
}

/**
 * Hook to mark an arbitrage opportunity as executed
 */
export function useExecuteArbitrage() {
  return useMutation({
    mutationFn: async (opportunityId: string) => {
      const res = await apiRequest("POST", `/api/intelligence/arbitrage/${opportunityId}/execute`);
      return res.json();
    },
  });
}


