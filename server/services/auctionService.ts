import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { executeTransaction, createDeleteRollback } from "../utils/transactions.js";
import {
  recordBidChange,
  calculateBidRank,
  getBidHistory,
  getBidRanking,
} from "./bidHistoryService.js";
import {
  checkPriceJump,
  checkBidRate,
  checkWashTrading,
} from "./circuitBreakerService.js";
import { logAction } from "./auditLogService.js";

/**
 * Auction Service
 * Handles auction creation, bidding, and winner determination
 * Enhanced with PRD v2.0 requirements including verification, material types, and lifecycle management
 */

export interface CreateAuctionInput {
  seller_id: string;
  title: string;
  description?: string;
  auction_type: "english" | "dutch" | "sealed_bid" | "reverse";
  
  // PRD-specific fields
  material_type: "Carbonate" | "Hydroxide" | "Spodumene";
  grade: "99" | "99.5" | "99.9";
  quantity_total: number;
  delivery_incoterms: "CIF" | "FOB" | "DDP";
  delivery_port?: string;
  delivery_date?: string;
  
  // Scheduling
  start_time?: string; // Optional for draft auctions
  end_time?: string; // Optional for draft auctions
  scheduled_start?: string; // For scheduled auctions
  scheduled_end?: string; // For scheduled auctions
  
  // Pricing
  reserve_price?: number;
  starting_price: number;
  currency?: string;
  bid_increment?: number;
  
  // Lifecycle
  status?: "draft" | "active"; // Default to draft
  launch_now?: boolean; // If true, launch immediately (requires start_time/end_time)
  
  // Legacy lots support (optional, for backward compatibility)
  lots?: Array<{
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
 * Generate unique auction number (format: AU-YYYYMMDD-XXX)
 */
async function generateAuctionNumber(): Promise<string> {
  const datePrefix = `AU-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-`;
  
  // Get the highest sequence number for today
  const { data: existing, error } = await supabaseAdmin
    .from("auctions")
    .select("auction_number")
    .like("auction_number", `${datePrefix}%`)
    .order("auction_number", { ascending: false })
    .limit(1);

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned", which is fine
    logger.warn({ error: error.message }, "Error checking existing auction numbers");
  }

  let sequenceNum = 1;
  if (existing && existing.length > 0) {
    const lastNumber = existing[0].auction_number;
    const lastSequence = parseInt(lastNumber.slice(-3), 10);
    sequenceNum = (lastSequence || 0) + 1;
  }

  return `${datePrefix}${sequenceNum.toString().padStart(3, "0")}`;
}

/**
 * Validate material and grade combination
 */
function validateMaterialGrade(
  materialType: string,
  grade: string
): void {
  // All material types support all grades, but we can add specific validations here
  const validGrades = ["99", "99.5", "99.9"];
  if (!validGrades.includes(grade)) {
    throw new ValidationError(`Invalid grade: ${grade}. Must be one of: ${validGrades.join(", ")}`);
  }

  const validMaterials = ["Carbonate", "Hydroxide", "Spodumene"];
  if (!validMaterials.includes(materialType)) {
    throw new ValidationError(
      `Invalid material type: ${materialType}. Must be one of: ${validMaterials.join(", ")}`
    );
  }
}

/**
 * Create a new auction with PRD v2.0 fields
 */
export async function createAuction(input: CreateAuctionInput): Promise<any> {
  try {
    // Validate material and grade
    validateMaterialGrade(input.material_type, input.grade);

    // Determine status and timing
    const status = input.status || "draft";
    const launchNow = input.launch_now || false;

    if (launchNow && status === "draft") {
      throw new ValidationError("Cannot launch_now with draft status. Set status to 'active' or remove launch_now flag.");
    }

    if (launchNow) {
      // Launch now requires start_time and end_time
      if (!input.start_time || !input.end_time) {
        throw new ValidationError("start_time and end_time are required when launch_now is true");
      }

      const startTime = new Date(input.start_time);
      const endTime = new Date(input.end_time);

      if (endTime <= startTime) {
        throw new ValidationError("End time must be after start time");
      }

      if (startTime < new Date()) {
        throw new ValidationError("Start time cannot be in the past when launching now");
      }
    } else if (status === "active") {
      // Active status requires scheduled times
      if (!input.scheduled_start || !input.scheduled_end) {
        throw new ValidationError("scheduled_start and scheduled_end are required for active auctions");
      }

      const scheduledStart = new Date(input.scheduled_start);
      const scheduledEnd = new Date(input.scheduled_end);

      if (scheduledEnd <= scheduledStart) {
        throw new ValidationError("scheduled_end must be after scheduled_start");
      }
    }

    // Generate unique auction number
    const auctionNumber = await generateAuctionNumber();

    // Use transaction to create auction and lots atomically
    const transactionResult = await executeTransaction([
      {
        description: `Create auction: ${input.title}`,
        execute: async () => {
          const auctionData: any = {
            seller_id: input.seller_id,
            title: input.title,
            description: input.description || null,
            auction_type: input.auction_type,
            status: status,
            auction_number: auctionNumber,
            
            // PRD fields
            material_type: input.material_type,
            grade: input.grade,
            quantity_total: input.quantity_total,
            quantity_remaining: input.quantity_total, // Initially all quantity is available
            delivery_incoterms: input.delivery_incoterms,
            delivery_port: input.delivery_port || null,
            delivery_date: input.delivery_date || null,
            
            // Pricing
            reserve_price: input.reserve_price || null,
            starting_price: input.starting_price,
            currency: input.currency || "USD",
            bid_increment: input.bid_increment || 100.0,
            current_bid: input.starting_price,
            
            // Verification (starts as pending)
            verification_status: "pending",
          };

          // Set timing based on status
          if (launchNow && input.start_time && input.end_time) {
            auctionData.start_time = input.start_time;
            auctionData.end_time = input.end_time;
            auctionData.scheduled_start = input.start_time;
            auctionData.scheduled_end = input.end_time;
          } else if (input.scheduled_start && input.scheduled_end) {
            auctionData.scheduled_start = input.scheduled_start;
            auctionData.scheduled_end = input.scheduled_end;
            // For draft/scheduled, we can set placeholder times
            if (input.start_time && input.end_time) {
              auctionData.start_time = input.start_time;
              auctionData.end_time = input.end_time;
            }
          }

          const { data: auction, error } = await supabaseAdmin
            .from("auctions")
            .insert(auctionData)
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
        description: `Create lots for auction (if provided)`,
        execute: async (results: any[]) => {
          const auction = results[0];
          if (!auction?.id) throw new Error("Auction ID not available");

          // Only create lots if provided (backward compatibility)
          if (!input.lots || input.lots.length === 0) {
            return [];
          }

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
      {
        auctionId: auction.id,
        auctionNumber: auction.auction_number,
        lotsCount: lots?.length || 0,
        status: auction.status,
      },
      "Auction created successfully"
    );

    return {
      ...auction,
      lots: lots || [],
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
 * Place a bid on an auction with bid history tracking
 */
export async function placeBid(
  auctionId: string,
  bidderId: string,
  amount: number,
  options?: {
    lotId?: string;
    ipAddress?: string;
    userAgent?: string;
  }
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

    // Validate auction status (PRD: active status)
    if (auction.status !== "active") {
      throw new ValidationError("Auction is not currently active");
    }

    // Validate time (use scheduled times if available, fallback to start_time/end_time)
    const now = new Date();
    const startTime = auction.scheduled_start
      ? new Date(auction.scheduled_start)
      : auction.start_time
      ? new Date(auction.start_time)
      : null;
    const endTime = auction.scheduled_end
      ? new Date(auction.scheduled_end)
      : auction.end_time
      ? new Date(auction.end_time)
      : null;

    if (!startTime || !endTime) {
      throw new ValidationError("Auction timing information is missing");
    }

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

    // PRD: Anti-manipulation safeguards
    // 1. Check bid rate (max 5/sec)
    const rateCheck = await checkBidRate(bidderId);
    if (rateCheck.shouldRateLimit) {
      throw new ValidationError(
        `Bid rate limit exceeded. Please wait ${Math.ceil((rateCheck.waitTimeMs || 0) / 1000)} seconds.`
      );
    }

    // 2. Check price jump >10%
    const priceJumpCheck = await checkPriceJump(auctionId, amount, auction.current_bid);
    if (priceJumpCheck.shouldFlag) {
      // Flag for audit but don't block (PRD: flag, don't block)
      logger.warn(
        {
          auctionId,
          bidderId,
          amount,
          reason: priceJumpCheck.reason,
        },
        "Price jump flagged for audit"
      );
    }

    // 3. Check for wash trading
    const washTradingCheck = await checkWashTrading({
      bidder_id: bidderId,
      auction_id: auctionId,
      ip_address: options?.ipAddress,
    });
    if (washTradingCheck.isWashTrading) {
      // Flag for audit but don't block
      logger.warn(
        {
          auctionId,
          bidderId,
          reason: washTradingCheck.reason,
        },
        "Wash trading detected - flagged for audit"
      );
    }

    // 4. Log bid action for audit trail
    await logAction("bid_placed", bidderId, options?.ipAddress, {
      auction_id: auctionId,
      amount,
      previous_bid: auction.current_bid,
    });

    // Calculate bid rank before placing
    const bidRank = await calculateBidRank(auctionId, amount);

    // Use transaction to place bid, update auction, and record history
    const transactionResult = await executeTransaction([
      {
        description: `Place bid on auction ${auctionId}`,
        execute: async () => {
          // Mark previous winning bid as not winning and record outbid
          const { data: previousBids } = await supabaseAdmin
            .from("bids")
            .select("id, bidder_id, amount")
            .eq("auction_id", auctionId)
            .eq("is_winning", true)
            .eq("is_retracted", false);

          if (previousBids && previousBids.length > 0) {
            // Mark as not winning
            await supabaseAdmin
              .from("bids")
              .update({ is_winning: false })
              .eq("auction_id", auctionId)
              .eq("is_winning", true);

            // Record outbid status for previous bids (will be done after new bid is created)
          }

          // Create new bid
          const { data: bid, error } = await supabaseAdmin
            .from("bids")
            .insert({
              auction_id: auctionId,
              lot_id: options?.lotId || null,
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
        execute: async (results: any[]) => {
          const bid = results[0];
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
      {
        description: `Record bid history`,
        execute: async (results: any[]) => {
          const bid = results[0];
          if (!bid) throw new Error("Bid not available");

          // Record new bid in history
          await recordBidChange(
            auctionId,
            bid.id,
            bidderId,
            amount,
            amount, // total_bid_amount (assuming per-unit bidding)
            "placed",
            {
              rankAtTime: bidRank,
              ipAddress: options?.ipAddress,
              userAgent: options?.userAgent,
            }
          );

          // Record outbid for previous winning bids
          const { data: previousBids } = await supabaseAdmin
            .from("bids")
            .select("id, bidder_id, amount")
            .eq("auction_id", auctionId)
            .eq("is_retracted", false)
            .neq("id", bid.id)
            .order("amount", { ascending: false })
            .limit(10); // Get recent bids to mark as outbid

          if (previousBids && previousBids.length > 0) {
            for (const prevBid of previousBids) {
              if (prevBid.amount < amount) {
                // This bid was outbid
                const prevRank = await calculateBidRank(auctionId, prevBid.amount);
                await recordBidChange(
                  auctionId,
                  prevBid.id,
                  prevBid.bidder_id,
                  prevBid.amount,
                  prevBid.amount,
                  "outbid",
                  {
                    rankAtTime: prevRank,
                  }
                );
              }
            }
          }

          return { recorded: true };
        },
        rollback: async () => {
          // History entries are append-only, no rollback needed
        },
      },
    ]);

    if (!transactionResult.success) {
      throw transactionResult.error || new ValidationError("Failed to place bid");
    }

    const [bid, updatedAuction] = transactionResult.data as [any, any];

    logger.info(
      { auctionId, bidderId, amount, bidId: bid.id, rank: bidRank },
      "Bid placed successfully"
    );

    return {
      bid,
      auction: updatedAuction,
      rank: bidRank,
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
 * List active auctions with PRD filters
 */
export async function listActiveAuctions(filters?: {
  // Legacy filters
  auction_type?: string;
  product_type?: string;
  
  // PRD filters
  material_type?: "Carbonate" | "Hydroxide" | "Spodumene" | string;
  grade?: "99" | "99.5" | "99.9" | string;
  delivery_terms?: "CIF" | "FOB" | "DDP" | string;
  price_min?: number;
  price_max?: number;
  time_remaining?: "1h" | "4h" | "24h" | string; // Filter by time remaining
  seller_rating?: number; // Minimum seller rating (4+ stars)
  
  // Pagination
  limit?: number;
  offset?: number;
  
  // Sorting
  sort_by?: "price" | "time_remaining" | "created_at";
  sort_order?: "asc" | "desc";
}): Promise<{ data: any[]; total: number }> {
  const limit = filters?.limit || 20;
  const offset = filters?.offset || 0;

  let query = supabaseAdmin
    .from("auctions")
    .select(`
      *,
      auction_lots(*)
    `, { count: "exact" })
    .eq("status", "active") // PRD: active status
    .gte("scheduled_end", new Date().toISOString()) // Only future auctions
    .range(offset, offset + limit - 1);

  // PRD: Material type filter
  if (filters?.material_type) {
    query = query.eq("material_type", filters.material_type);
  }

  // PRD: Grade filter
  if (filters?.grade) {
    query = query.eq("grade", filters.grade);
  }

  // PRD: Delivery terms filter
  if (filters?.delivery_terms) {
    query = query.eq("delivery_incoterms", filters.delivery_terms);
  }

  // PRD: Price range filter
  if (filters?.price_min !== undefined) {
    query = query.gte("starting_price", filters.price_min);
  }
  if (filters?.price_max !== undefined) {
    query = query.lte("starting_price", filters.price_max);
  }

  // PRD: Time remaining filter
  if (filters?.time_remaining) {
    const now = new Date();
    let maxTime: Date;
    
    switch (filters.time_remaining) {
      case "1h":
        maxTime = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case "4h":
        maxTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);
        break;
      case "24h":
        maxTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      default:
        maxTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
    
    query = query.lte("scheduled_end", maxTime.toISOString());
  }

  // Legacy filters (for backward compatibility)
  if (filters?.auction_type) {
    query = query.eq("auction_type", filters.auction_type);
  }

  if (filters?.product_type) {
    query = query.eq("auction_lots.product_type", filters.product_type);
  }

  // Sorting
  const sortBy = filters?.sort_by || "scheduled_start";
  const sortOrder = filters?.sort_order || "asc";
  
  if (sortBy === "price") {
    query = query.order("starting_price", { ascending: sortOrder === "asc" });
  } else if (sortBy === "time_remaining") {
    query = query.order("scheduled_end", { ascending: sortOrder === "asc" });
  } else {
    query = query.order("scheduled_start", { ascending: sortOrder === "asc" });
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch auctions: ${error.message}`);
  }

  // TODO: Filter by seller rating (requires join with supplier ratings table)
  // For now, seller_rating filter is a placeholder

  return {
    data: data || [],
    total: count || 0,
  };
}

/**
 * Launch an auction (move from draft to active)
 */
export async function launchAuction(auctionId: string): Promise<any> {
  try {
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from("auctions")
      .select("*")
      .eq("id", auctionId)
      .single();

    if (auctionError || !auction) {
      throw new NotFoundError("Auction");
    }

    if (auction.status !== "draft") {
      throw new ValidationError("Only draft auctions can be launched");
    }

    if (!auction.scheduled_start || !auction.scheduled_end) {
      throw new ValidationError("Auction must have scheduled_start and scheduled_end to launch");
    }

    const scheduledStart = new Date(auction.scheduled_start);
    const now = new Date();

    // Update status to active
    const { data: launchedAuction, error: updateError } = await supabaseAdmin
      .from("auctions")
      .update({
        status: "active",
        start_time: auction.scheduled_start,
        end_time: auction.scheduled_end,
      })
      .eq("id", auctionId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to launch auction: ${updateError.message}`);
    }

    logger.info({ auctionId, scheduledStart: auction.scheduled_start }, "Auction launched");

    return launchedAuction;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
      },
      "Failed to launch auction"
    );
    throw error;
  }
}

/**
 * Schedule an auction for future start
 */
export async function scheduleAuction(
  auctionId: string,
  scheduledStart: string,
  scheduledEnd: string
): Promise<any> {
  try {
    const startTime = new Date(scheduledStart);
    const endTime = new Date(scheduledEnd);
    const now = new Date();

    if (endTime <= startTime) {
      throw new ValidationError("scheduled_end must be after scheduled_start");
    }

    if (startTime < now) {
      throw new ValidationError("scheduled_start cannot be in the past");
    }

    const { data: scheduledAuction, error } = await supabaseAdmin
      .from("auctions")
      .update({
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEnd,
        status: "draft", // Keep as draft until launched
      })
      .eq("id", auctionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to schedule auction: ${error.message}`);
    }

    logger.info({ auctionId, scheduledStart, scheduledEnd }, "Auction scheduled");

    return scheduledAuction;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
      },
      "Failed to schedule auction"
    );
    throw error;
  }
}

/**
 * Check if reserve price is met
 */
export async function checkReservePrice(auctionId: string): Promise<boolean> {
  try {
    const { data: auction, error } = await supabaseAdmin
      .from("auctions")
      .select("reserve_price, current_bid")
      .eq("id", auctionId)
      .single();

    if (error || !auction) {
      throw new NotFoundError("Auction");
    }

    if (!auction.reserve_price) {
      return true; // No reserve price means it's always met
    }

    return auction.current_bid >= auction.reserve_price;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
      },
      "Failed to check reserve price"
    );
    throw error;
  }
}

/**
 * Determine auction winner(s) - supports multi-winner partial fulfillment
 */
export async function determineWinner(auctionId: string): Promise<any> {
  try {
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from("auctions")
      .select("*")
      .eq("id", auctionId)
      .single();

    if (auctionError || !auction) {
      throw new NotFoundError("Auction");
    }

    // Get all active bids ordered by amount (descending)
    const { data: bids, error: bidsError } = await supabaseAdmin
      .from("bids")
      .select("*")
      .eq("auction_id", auctionId)
      .eq("is_retracted", false)
      .order("amount", { ascending: false });

    if (bidsError) {
      throw new Error(`Failed to fetch bids: ${bidsError.message}`);
    }

    if (!bids || bids.length === 0) {
      return { winners: [], totalWon: 0 };
    }

    // For now, implement single-winner logic
    // TODO: Implement multi-winner partial fulfillment logic
    const winningBid = bids[0];
    const quantityWon = auction.quantity_remaining || auction.quantity_total;

    // Create auction winner record
    const { data: winner, error: winnerError } = await supabaseAdmin
      .from("auction_winners")
      .insert({
        auction_id: auctionId,
        bid_id: winningBid.id,
        buyer_id: winningBid.bidder_id,
        quantity_won: quantityWon,
        price_per_unit: winningBid.amount,
        total_amount: quantityWon * winningBid.amount,
        status: "pending",
      })
      .select()
      .single();

    if (winnerError) {
      throw new Error(`Failed to create winner record: ${winnerError.message}`);
    }

    // Record "won" status in bid history
    await recordBidChange(
      auctionId,
      winningBid.id,
      winningBid.bidder_id,
      winningBid.amount,
      quantityWon * winningBid.amount,
      "won"
    );

    logger.info(
      {
        auctionId,
        winnerId: winningBid.bidder_id,
        winningAmount: winningBid.amount,
        quantityWon,
      },
      "Auction winner determined"
    );

    return {
      winners: [winner],
      totalWon: quantityWon,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
      },
      "Failed to determine winner"
    );
    throw error;
  }
}

/**
 * Close an auction (PRD: status changes to 'closed')
 */
export async function closeAuction(auctionId: string): Promise<any> {
  try {
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from("auctions")
      .select("*")
      .eq("id", auctionId)
      .single();

    if (auctionError || !auction) {
      throw new NotFoundError("Auction");
    }

    if (auction.status === "closed" || auction.status === "completed") {
      throw new ValidationError("Auction has already been closed");
    }

    // Check reserve price
    const reserveMet = await checkReservePrice(auctionId);

    if (!reserveMet && auction.reserve_price) {
      // Reserve not met, close without winner
      const { data: closedAuction, error: updateError } = await supabaseAdmin
        .from("auctions")
        .update({
          status: "closed",
        })
        .eq("id", auctionId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to close auction: ${updateError.message}`);
      }

      logger.info({ auctionId, reason: "reserve_not_met" }, "Auction closed without winner");
      return closedAuction;
    }

    // Determine winner(s)
    const winnerResult = await determineWinner(auctionId);

    if (winnerResult.winners.length === 0) {
      // No bids, close without winner
      const { data: closedAuction, error: updateError } = await supabaseAdmin
        .from("auctions")
        .update({
          status: "closed",
        })
        .eq("id", auctionId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to close auction: ${updateError.message}`);
      }

      return closedAuction;
    }

    // Update auction with winner and final price
    const winningBid = winnerResult.winners[0];
    const { data: closedAuction, error: updateError } = await supabaseAdmin
      .from("auctions")
      .update({
        status: "closed",
        winning_bid_id: winningBid.bid_id,
        winning_buyer_id: winningBid.buyer_id,
        final_price: winningBid.price_per_unit,
        quantity_remaining: (auction.quantity_remaining || auction.quantity_total) - winningBid.quantity_won,
      })
      .eq("id", auctionId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to close auction: ${updateError.message}`);
    }

    logger.info(
      {
        auctionId,
        winnerId: winningBid.buyer_id,
        finalPrice: winningBid.price_per_unit,
        quantityWon: winningBid.quantity_won,
      },
      "Auction closed with winner"
    );

    return closedAuction;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
      },
      "Failed to close auction"
    );
    throw error;
  }
}

/**
 * Determine auction winner and end auction (legacy function, use closeAuction instead)
 * @deprecated Use closeAuction instead for PRD compliance
 */
export async function endAuction(auctionId: string): Promise<any> {
  return closeAuction(auctionId);
}

/**
 * Update auction status (PRD: draft, active, closed, completed, cancelled)
 */
export async function updateAuctionStatus(
  auctionId: string,
  status: "draft" | "active" | "closed" | "completed" | "cancelled"
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

  logger.info({ auctionId, status }, "Auction status updated");

  return data;
}


