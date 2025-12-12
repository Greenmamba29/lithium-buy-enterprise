import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { executeTransaction, createDeleteRollback } from "../utils/transactions.js";

/**
 * Auction Service
 * Handles auction creation, bidding, and winner determination
 */

export interface CreateAuctionInput {
  seller_id: string;
  title: string;
  description?: string;
  auction_type: "english" | "dutch" | "sealed_bid" | "reverse";
  start_time: string;
  end_time: string;
  reserve_price?: number;
  starting_price: number;
  currency?: string;
  bid_increment?: number;
  lots: Array<{
    lot_number: number;
    title: string;
    description?: string;
    quantity: number;
    unit?: string;
    product_type?: "raw" | "compound" | "processed";
    purity_level?: "99" | "99.5" | "99.9";
    location_country?: string;
    location_city?: string;
  }>;
}

/**
 * Create a new auction
 */
export async function createAuction(input: CreateAuctionInput): Promise<any> {
  try {
    // Validate time range
    const startTime = new Date(input.start_time);
    const endTime = new Date(input.end_time);

    if (endTime <= startTime) {
      throw new ValidationError("End time must be after start time");
    }

    if (startTime < new Date()) {
      throw new ValidationError("Start time cannot be in the past");
    }

    // Use transaction to create auction and lots atomically
    const transactionResult = await executeTransaction([
      {
        description: `Create auction: ${input.title}`,
        execute: async () => {
          const { data: auction, error } = await supabaseAdmin
            .from("auctions")
            .insert({
              seller_id: input.seller_id,
              title: input.title,
              description: input.description || null,
              auction_type: input.auction_type,
              status: "scheduled",
              start_time: input.start_time,
              end_time: input.end_time,
              reserve_price: input.reserve_price || null,
              starting_price: input.starting_price,
              currency: input.currency || "USD",
              bid_increment: input.bid_increment || 100.0,
              current_bid: input.starting_price,
            })
            .select()
            .single();

          if (error) {
            throw new Error(`Failed to create auction: ${error.message}`);
          }

          return auction;
        },
        rollback: async (auction: any) => {
          if (auction?.id) {
            await createDeleteRollback("auctions", auction.id)();
          }
        },
      },
      {
        description: `Create lots for auction`,
        execute: async (results?: any[]) => {
          const auction = results?.[0];
          if (!auction?.id) throw new Error("Auction ID not available");

          const lotsToInsert = input.lots.map((lot) => ({
            auction_id: auction.id,
            lot_number: lot.lot_number,
            title: lot.title,
            description: lot.description || null,
            quantity: lot.quantity,
            unit: lot.unit || "ton",
            product_type: lot.product_type || null,
            purity_level: lot.purity_level || null,
            location_country: lot.location_country || null,
            location_city: lot.location_city || null,
          }));

          const { data: lots, error } = await supabaseAdmin
            .from("auction_lots")
            .insert(lotsToInsert)
            .select();

          if (error) {
            throw new Error(`Failed to create lots: ${error.message}`);
          }

          return lots;
        },
        rollback: async (lots: any[]) => {
          if (lots && lots.length > 0) {
            const ids = lots.map((lot) => lot.id).filter(Boolean);
            for (const id of ids) {
              await createDeleteRollback("auction_lots", id)();
            }
          }
        },
      },
    ]);

    if (!transactionResult.success) {
      throw transactionResult.error || new ValidationError("Failed to create auction");
    }

    const [auction, lots] = transactionResult.data as [any, any[]];

    logger.info(
      { auctionId: auction.id, lotsCount: lots.length },
      "Auction created successfully"
    );

    return {
      ...auction,
      lots,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        input,
      },
      "Failed to create auction"
    );
    throw error;
  }
}

/**
 * Place a bid on an auction
 */
export async function placeBid(
  auctionId: string,
  bidderId: string,
  amount: number,
  lotId?: string
): Promise<any> {
  try {
    // Get auction
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from("auctions")
      .select("*")
      .eq("id", auctionId)
      .single();

    if (auctionError || !auction) {
      throw new NotFoundError("Auction");
    }

    // Validate auction status
    if (auction.status !== "live") {
      throw new ValidationError("Auction is not currently live");
    }

    // Validate time
    const now = new Date();
    const startTime = new Date(auction.start_time);
    const endTime = new Date(auction.end_time);

    if (now < startTime) {
      throw new ValidationError("Auction has not started yet");
    }

    if (now >= endTime) {
      throw new ValidationError("Auction has ended");
    }

    // Validate bid amount
    if (amount <= auction.current_bid) {
      throw new ValidationError(`Bid must be higher than current bid of ${auction.current_bid}`);
    }

    const minBid = auction.current_bid + auction.bid_increment;
    if (amount < minBid) {
      throw new ValidationError(`Bid must be at least ${minBid} (current + increment)`);
    }

    // Check if bidder is the seller
    if (bidderId === auction.seller_id) {
      throw new ValidationError("Seller cannot bid on their own auction");
    }

    // Use transaction to place bid and update auction
    const transactionResult = await executeTransaction([
      {
        description: `Place bid on auction ${auctionId}`,
        execute: async () => {
          // Mark previous winning bid as not winning
          await supabaseAdmin
            .from("bids")
            .update({ is_winning: false })
            .eq("auction_id", auctionId)
            .eq("is_winning", true);

          // Create new bid
          const { data: bid, error } = await supabaseAdmin
            .from("bids")
            .insert({
              auction_id: auctionId,
              lot_id: lotId || null,
              bidder_id: bidderId,
              amount,
              currency: auction.currency,
              is_winning: true,
            })
            .select()
            .single();

          if (error) {
            throw new Error(`Failed to place bid: ${error.message}`);
          }

          return bid;
        },
        rollback: async (bid: any) => {
          if (bid?.id) {
            await createDeleteRollback("bids", bid.id)();
          }
        },
      },
      {
        description: `Update auction current bid`,
        execute: async (results?: any[]) => {
          const bid = results?.[0];
          if (!bid) throw new Error("Bid not available");

          const { data: updatedAuction, error } = await supabaseAdmin
            .from("auctions")
            .update({
              current_bid: amount,
            })
            .eq("id", auctionId)
            .select()
            .single();

          if (error) {
            throw new Error(`Failed to update auction: ${error.message}`);
          }

          return updatedAuction;
        },
        rollback: async () => {
          // Restore previous current_bid
          await supabaseAdmin
            .from("auctions")
            .update({ current_bid: auction.current_bid })
            .eq("id", auctionId);
        },
      },
    ]);

    if (!transactionResult.success) {
      throw transactionResult.error || new ValidationError("Failed to place bid");
    }

    const [bid, updatedAuction] = transactionResult.data as [any, any];

    logger.info(
      { auctionId, bidderId, amount, bidId: bid.id },
      "Bid placed successfully"
    );

    return {
      bid,
      auction: updatedAuction,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
        bidderId,
        amount,
      },
      "Failed to place bid"
    );
    throw error;
  }
}

/**
 * Get auction details with bids
 */
export async function getAuctionById(auctionId: string): Promise<any> {
  const { data: auction, error } = await supabaseAdmin
    .from("auctions")
    .select(`
      *,
      auction_lots(*),
      bids(*, bidder:auth.users(id, email))
    `)
    .eq("id", auctionId)
    .single();

  if (error || !auction) {
    throw new NotFoundError("Auction");
  }

  return auction;
}

/**
 * List active auctions
 */
export async function listActiveAuctions(filters?: {
  auction_type?: string;
  product_type?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: any[]; total: number }> {
  const limit = filters?.limit || 20;
  const offset = filters?.offset || 0;

  let query = supabaseAdmin
    .from("auctions")
    .select(`
      *,
      auction_lots(*)
    `, { count: "exact" })
    .in("status", ["scheduled", "live"])
    .gte("end_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .range(offset, offset + limit - 1);

  if (filters?.auction_type) {
    query = query.eq("auction_type", filters.auction_type);
  }

  if (filters?.product_type) {
    query = query.eq("auction_lots.product_type", filters.product_type);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch auctions: ${error.message}`);
  }

  return {
    data: data || [],
    total: count || 0,
  };
}

/**
 * Determine auction winner and end auction
 */
export async function endAuction(auctionId: string): Promise<any> {
  try {
    // Get auction
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from("auctions")
      .select("*")
      .eq("id", auctionId)
      .single();

    if (auctionError || !auction) {
      throw new NotFoundError("Auction");
    }

    if (auction.status === "ended") {
      throw new ValidationError("Auction has already ended");
    }

    // Get winning bid
    const { data: winningBid, error: bidError } = await supabaseAdmin
      .from("bids")
      .select("*")
      .eq("auction_id", auctionId)
      .eq("is_winning", true)
      .order("amount", { ascending: false })
      .limit(1)
      .single();

    if (bidError || !winningBid) {
      // No bids, just end the auction
      const { data: endedAuction, error: updateError } = await supabaseAdmin
        .from("auctions")
        .update({
          status: "ended",
        })
        .eq("id", auctionId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to end auction: ${updateError.message}`);
      }

      return endedAuction;
    }

    // Check reserve price
    if (auction.reserve_price && winningBid.amount < auction.reserve_price) {
      // Reserve not met, end without winner
      const { data: endedAuction, error: updateError } = await supabaseAdmin
        .from("auctions")
        .update({
          status: "ended",
        })
        .eq("id", auctionId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to end auction: ${updateError.message}`);
      }

      return endedAuction;
    }

    // Update auction with winner
    const { data: endedAuction, error: updateError } = await supabaseAdmin
      .from("auctions")
      .update({
        status: "ended",
        winner_id: winningBid.bidder_id,
      })
      .eq("id", auctionId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to end auction: ${updateError.message}`);
    }

    logger.info(
      { auctionId, winnerId: winningBid.bidder_id, winningAmount: winningBid.amount },
      "Auction ended with winner"
    );

    return endedAuction;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
      },
      "Failed to end auction"
    );
    throw error;
  }
}

/**
 * Update auction status (e.g., from scheduled to live)
 */
export async function updateAuctionStatus(
  auctionId: string,
  status: "draft" | "scheduled" | "live" | "ended" | "cancelled"
): Promise<any> {
  const { data, error } = await supabaseAdmin
    .from("auctions")
    .update({ status })
    .eq("id", auctionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update auction status: ${error.message}`);
  }

  return data;
}


