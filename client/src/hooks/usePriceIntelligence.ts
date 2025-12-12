import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface PriceIntelligenceData {
  current_price: number;
  price_change_24h: number;
  price_change_percent_24h: number;
  price_trend: "up" | "down" | "stable";
  average_price_7d: number;
  min_price_7d: number;
  max_price_7d: number;
  price_history: Array<{
    timestamp: string;
    price: number;
  }>;
}

/**
 * Hook to fetch price intelligence for a specific product
 */
export function usePriceIntelligence(
  productType: "raw" | "compound" | "processed",
  purityLevel: "99" | "99.5" | "99.9",
  location?: string
) {
  return useQuery({
    queryKey: ["price-intelligence", productType, purityLevel, location],
    queryFn: async (): Promise<PriceIntelligenceData> => {
      const params = new URLSearchParams({
        productType,
        purityLevel,
      });
      if (location) params.append("location", location);

      const res = await apiRequest("GET", `/api/intelligence/price?${params.toString()}`);
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000,
  });
}

/**
 * Hook to fetch price alerts for the current user
 */
export function usePriceAlerts() {
  return useQuery({
    queryKey: ["price-alerts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/intelligence/alerts");
      return res.json();
    },
  });
}

/**
 * Hook to create a price alert
 */
export function useCreatePriceAlert() {
  return useMutation({
    mutationFn: async (alert: {
      product_type: "raw" | "compound" | "processed";
      purity_level?: "99" | "99.5" | "99.9";
      alert_type: "above" | "below" | "change_percent";
      target_price?: number;
      change_percent?: number;
      location_country?: string;
    }) => {
      const res = await apiRequest("POST", "/api/intelligence/alerts", alert);
      return res.json();
    },
  });
}


