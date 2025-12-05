import { useEffect, useState } from "react";
import { useWebSocket } from "./useWebSocket";

interface PriceUpdate {
  type: "price_update";
  data: {
    new: {
      price_per_unit: number;
      product_type: string;
      purity_level: string;
      timestamp: string;
    };
  };
}

/**
 * Hook for real-time price updates
 */
export function useRealtimePrices() {
  const [latestPrice, setLatestPrice] = useState<PriceUpdate["data"] | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceUpdate["data"]["new"][]>([]);

  const { isConnected, subscribe, unsubscribe, lastMessage } = useWebSocket({
    onMessage: (message) => {
      if (message.type === "price_update") {
        const update = message.data as PriceUpdate["data"];
        setLatestPrice(update);
        setPriceHistory((prev) => [update.new, ...prev].slice(0, 100)); // Keep last 100
      }
    },
  });

  useEffect(() => {
    if (!isConnected) return;

    subscribe("prices");

    return () => {
      unsubscribe("prices");
    };
  }, [isConnected, subscribe, unsubscribe]);

  return {
    isConnected,
    latestPrice: latestPrice?.new || null,
    priceHistory,
  };
}
