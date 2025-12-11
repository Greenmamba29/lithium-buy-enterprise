import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { NotFoundError } from "../utils/errors.js";

/**
 * Bid History Service
 * Manages complete audit trail of all bid changes for compliance and fraud detection
 */

export interface BidHistoryEntry {
  id: string;
  auction_id: string;
  bid_id: string;
  buyer_id: string;
  bid_price_per_unit: number;
  bid_quantity?: number;
  total_bid_amount: number;
  status_change: "placed" | "revised" | "outbid" | "withdrawn" | "won";
  rank_at_time?: number;
  timestamp: Date;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Record a bid change in history
 */
export async function recordBidChange(
  auctionId: string,
  bidId: string,
  buyerId: string,
  bidPricePerUnit: number,
  totalBidAmount: number,
  statusChange: "placed" | "revised" | "outbid" | "withdrawn" | "won",
  options?: {
    bidQuantity?: number;
    rankAtTime?: number;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<BidHistoryEntry> {
  try {
    const { data, error } = await supabaseAdmin
      .from("bid_history")
      .insert({
        auction_id: auctionId,
        bid_id: bidId,
        buyer_id: buyerId,
        bid_price_per_unit: bidPricePerUnit,
        bid_quantity: options?.bidQuantity || null,
        total_bid_amount: totalBidAmount,
        status_change: statusChange,
        rank_at_time: options?.rankAtTime || null,
        ip_address: options?.ipAddress || null,
        user_agent: options?.userAgent || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record bid history: ${error.message}`);
    }

    logger.info(
      {
        auctionId,
        bidId,
        buyerId,
        statusChange,
      },
      "Bid history entry recorded"
    );

    return data as BidHistoryEntry;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
        bidId,
      },
      "Failed to record bid history"
    );
    throw error;
  }
}

/**
 * Get complete bid history for an auction
 */
export async function getBidHistory(auctionId: string): Promise<BidHistoryEntry[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("bid_history")
      .select("*")
      .eq("auction_id", auctionId)
      .order("timestamp", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch bid history: ${error.message}`);
    }

    return (data || []) as BidHistoryEntry[];
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
      },
      "Failed to get bid history"
    );
    throw error;
  }
}

/**
 * Get current bid rankings for an auction
 */
export async function getBidRanking(auctionId: string): Promise<
  Array<{
    bid_id: string;
    buyer_id: string;
    bid_price_per_unit: number;
    total_bid_amount: number;
    rank: number;
    timestamp: Date;
  }>
> {
  try {
    // Get all active bids (not withdrawn) ordered by amount
    const { data: bids, error: bidsError } = await supabaseAdmin
      .from("bids")
      .select("id, bidder_id, amount, currency, created_at")
      .eq("auction_id", auctionId)
      .eq("is_retracted", false)
      .order("amount", { ascending: false });

    if (bidsError) {
      throw new Error(`Failed to fetch bids: ${bidsError.message}`);
    }

    // Get latest history entry for each bid to determine rank
    const { data: history, error: historyError } = await supabaseAdmin
      .from("bid_history")
      .select("bid_id, rank_at_time, timestamp")
      .eq("auction_id", auctionId)
      .in(
        "bid_id",
        (bids || []).map((b) => b.id)
      )
      .order("timestamp", { ascending: false });

    if (historyError) {
      throw new Error(`Failed to fetch bid history: ${historyError.message}`);
    }

    // Build ranking with latest rank information
    const rankings = (bids || []).map((bid, index) => {
      const latestHistory = (history || []).find((h) => h.bid_id === bid.id);
      return {
        bid_id: bid.id,
        buyer_id: bid.bidder_id,
        bid_price_per_unit: bid.amount,
        total_bid_amount: bid.amount, // Assuming per-unit bidding for now
        rank: latestHistory?.rank_at_time || index + 1,
        timestamp: new Date(bid.created_at),
      };
    });

    return rankings.sort((a, b) => b.bid_price_per_unit - a.bid_price_per_unit);
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
      },
      "Failed to get bid ranking"
    );
    throw error;
  }
}

/**
 * Calculate rank for a new bid
 */
export async function calculateBidRank(
  auctionId: string,
  bidAmount: number
): Promise<number> {
  try {
    const { data: higherBids, error } = await supabaseAdmin
      .from("bids")
      .select("id", { count: "exact", head: true })
      .eq("auction_id", auctionId)
      .eq("is_retracted", false)
      .gt("amount", bidAmount);

    if (error) {
      throw new Error(`Failed to calculate bid rank: ${error.message}`);
    }

    // Rank is number of higher bids + 1
    return (higherBids?.length || 0) + 1;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
        bidAmount,
      },
      "Failed to calculate bid rank"
    );
    throw error;
  }
}

