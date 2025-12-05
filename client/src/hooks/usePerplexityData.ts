import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

/**
 * Hook to fetch real-time price data from Perplexity
 */
export function usePerplexityPrices(filters?: {
  productType?: "raw" | "compound" | "processed";
  purityLevel?: "99" | "99.5" | "99.9";
  location?: string;
}) {
  return useQuery({
    queryKey: ["perplexity", "prices", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.productType) params.append("productType", filters.productType);
      if (filters?.purityLevel) params.append("purityLevel", filters.purityLevel);
      if (filters?.location) params.append("location", filters.location);

      const res = await apiRequest("GET", `/api/perplexity/prices?${params.toString()}`);
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

/**
 * Hook to fetch market news with sentiment
 */
export function useMarketNews(limit = 10) {
  return useQuery({
    queryKey: ["perplexity", "news", limit],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/perplexity/news?limit=${limit}`);
      return res.json();
    },
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
}

/**
 * Hook to fetch arbitrage opportunities
 */
export function useArbitrageOpportunities(filters?: {
  minProfit?: number;
  status?: "active" | "expired" | "executed";
}) {
  return useQuery({
    queryKey: ["perplexity", "arbitrage", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.minProfit) params.append("minProfit", filters.minProfit.toString());
      if (filters?.status) params.append("status", filters.status);

      const res = await apiRequest("GET", `/api/perplexity/arbitrage?${params.toString()}`);
      return res.json();
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}

/**
 * Hook to fetch daily market briefing
 */
export function useDailyBriefing(date?: string) {
  return useQuery({
    queryKey: ["perplexity", "briefing", date || "latest"],
    queryFn: async () => {
      const params = date ? `?date=${date}` : "";
      const res = await apiRequest("GET", `/api/perplexity/briefing${params}`);
      return res.json();
    },
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
    staleTime: 30 * 60 * 1000, // Consider data stale after 30 minutes
  });
}

/**
 * Hook to trigger manual price sync
 */
export function useSyncPrices() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/perplexity/sync/prices");
      return res.json();
    },
  });
}


