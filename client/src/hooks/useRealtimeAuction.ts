import { useEffect, useState } from "react";
import { useWebSocket } from "./useWebSocket";

interface AuctionUpdate {
  type: "auction_update" | "new_bid";
  data: any;
}

/**
 * Hook for real-time auction updates
 */
export function useRealtimeAuction(auctionId: string | undefined) {
  const [latestBid, setLatestBid] = useState<any>(null);
  const [auctionUpdate, setAuctionUpdate] = useState<any>(null);

  const { isConnected, subscribe, unsubscribe, lastMessage } = useWebSocket({
    onMessage: (message) => {
      if (message.type === "new_bid") {
        setLatestBid(message.data);
      } else if (message.type === "auction_update") {
        setAuctionUpdate(message.data);
      }
    },
  });

  useEffect(() => {
    if (!auctionId || !isConnected) return;

    subscribe(`auction:${auctionId}`);

    return () => {
      unsubscribe(`auction:${auctionId}`);
    };
  }, [auctionId, isConnected, subscribe, unsubscribe]);

  return {
    isConnected,
    latestBid,
    auctionUpdate,
  };
}
