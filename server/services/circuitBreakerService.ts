import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { ValidationError } from "../utils/errors.js";

/**
 * Circuit Breaker Service
 * PRD: Anti-manipulation safeguards
 * - Price jump >10% in 1 min: Flag for audit
 * - Bid rate >5/sec: Rate-limit to 1 per 500ms
 * - Seller cancellation post-spike: Detect as spoofing
 * - Wash trading: Same IP, email domain, payment method
 */

interface BidRateTracker {
  userId: string;
  bids: Array<{ timestamp: number }>;
}

// In-memory bid rate tracking (should be moved to Redis in production)
const bidRateTrackers = new Map<string, BidRateTracker>();

/**
 * Check for price jump >10% in 1 minute
 * Returns true if should flag for audit
 */
export async function checkPriceJump(
  auctionId: string,
  newBid: number,
  previousBid: number
): Promise<{ shouldFlag: boolean; reason?: string }> {
  try {
    if (previousBid <= 0) {
      return { shouldFlag: false }; // First bid, no jump to check
    }

    const priceChange = ((newBid - previousBid) / previousBid) * 100;

    if (priceChange > 10) {
      logger.warn(
        {
          auctionId,
          previousBid,
          newBid,
          priceChange,
        },
        "Price jump >10% detected - flagging for audit"
      );

      // Record in audit log
      await logAuditAction("price_jump_detected", {
        auction_id: auctionId,
        previous_bid: previousBid,
        new_bid: newBid,
        price_change_percent: priceChange,
      });

      return {
        shouldFlag: true,
        reason: `Price jump of ${priceChange.toFixed(2)}% exceeds 10% threshold`,
      };
    }

    return { shouldFlag: false };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
        newBid,
        previousBid,
      },
      "Failed to check price jump"
    );
    return { shouldFlag: false };
  }
}

/**
 * Check bid rate (max 5/sec per user)
 * Returns true if rate limit should be applied
 */
export async function checkBidRate(userId: string): Promise<{
  shouldRateLimit: boolean;
  waitTimeMs?: number;
}> {
  try {
    const now = Date.now();
    const oneSecondAgo = now - 1000;

    let tracker = bidRateTrackers.get(userId);
    if (!tracker) {
      tracker = { userId, bids: [] };
      bidRateTrackers.set(userId, tracker);
    }

    // Remove bids older than 1 second
    tracker.bids = tracker.bids.filter((bid) => bid.timestamp > oneSecondAgo);

    // Check if rate exceeds 5/sec
    if (tracker.bids.length >= 5) {
      logger.warn(
        {
          userId,
          bidCount: tracker.bids.length,
        },
        "Bid rate >5/sec detected - applying rate limit"
      );

      // Rate limit to 1 per 500ms
      const oldestBid = tracker.bids[0];
      const waitTime = 500 - (now - oldestBid.timestamp);

      return {
        shouldRateLimit: true,
        waitTimeMs: Math.max(0, waitTime),
      };
    }

    // Record this bid
    tracker.bids.push({ timestamp: now });

    return { shouldRateLimit: false };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        userId,
      },
      "Failed to check bid rate"
    );
    return { shouldRateLimit: false };
  }
}

/**
 * Check for seller cancellation post-spike (spoofing detection)
 */
export async function checkSellerCancellation(auctionId: string): Promise<{
  isSuspicious: boolean;
  reason?: string;
}> {
  try {
    const { data: auction, error } = await supabaseAdmin
      .from("auctions")
      .select("seller_id, status, current_bid, starting_price, created_at")
      .eq("id", auctionId)
      .single();

    if (error || !auction) {
      return { isSuspicious: false };
    }

    // Check if auction was cancelled after price spike
    if (auction.status === "cancelled") {
      const priceIncrease = ((auction.current_bid - auction.starting_price) / auction.starting_price) * 100;

      if (priceIncrease > 20) {
        // Significant price increase before cancellation
        logger.warn(
          {
            auctionId,
            sellerId: auction.seller_id,
            priceIncrease,
          },
          "Seller cancellation post-spike detected - potential spoofing"
        );

        await logAuditAction("seller_cancellation_post_spike", {
          auction_id: auctionId,
          seller_id: auction.seller_id,
          price_increase_percent: priceIncrease,
        });

        return {
          isSuspicious: true,
          reason: `Auction cancelled after ${priceIncrease.toFixed(2)}% price increase`,
        };
      }
    }

    return { isSuspicious: false };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
      },
      "Failed to check seller cancellation"
    );
    return { isSuspicious: false };
  }
}

/**
 * Check for wash trading (same IP, email domain, payment method)
 */
export async function checkWashTrading(bid: {
  bidder_id: string;
  auction_id: string;
  ip_address?: string;
}): Promise<{ isWashTrading: boolean; reason?: string }> {
  try {
    // Get seller info
    const { data: auction } = await supabaseAdmin
      .from("auctions")
      .select("seller_id")
      .eq("id", bid.auction_id)
      .single();

    if (!auction) {
      return { isWashTrading: false };
    }

    // Check if bidder and seller have same email domain
    const { data: bidder } = await supabaseAdmin
      .from("auth.users")
      .select("email")
      .eq("id", bid.bidder_id)
      .single();

    const { data: seller } = await supabaseAdmin
      .from("auth.users")
      .select("email")
      .eq("id", auction.seller_id)
      .single();

    if (bidder?.email && seller?.email) {
      const bidderDomain = bidder.email.split("@")[1];
      const sellerDomain = seller.email.split("@")[1];

      if (bidderDomain === sellerDomain) {
        logger.warn(
          {
            auctionId: bid.auction_id,
            bidderId: bid.bidder_id,
            sellerId: auction.seller_id,
            domain: bidderDomain,
          },
          "Wash trading detected: Same email domain"
        );

        await logAuditAction("wash_trading_detected", {
          auction_id: bid.auction_id,
          bidder_id: bid.bidder_id,
          seller_id: auction.seller_id,
          reason: "same_email_domain",
        });

        return {
          isWashTrading: true,
          reason: "Bidder and seller share same email domain",
        };
      }
    }

    // Check for same IP address (if available)
    if (bid.ip_address) {
      const { data: otherBids } = await supabaseAdmin
        .from("bid_history")
        .select("buyer_id, ip_address")
        .eq("auction_id", bid.auction_id)
        .eq("ip_address", bid.ip_address)
        .neq("buyer_id", bid.bidder_id);

      if (otherBids && otherBids.length > 0) {
        // Multiple different buyers from same IP
        logger.warn(
          {
            auctionId: bid.auction_id,
            ipAddress: bid.ip_address,
            bidCount: otherBids.length + 1,
          },
          "Wash trading detected: Multiple buyers from same IP"
        );

        await logAuditAction("wash_trading_detected", {
          auction_id: bid.auction_id,
          ip_address: bid.ip_address,
          reason: "same_ip_address",
        });

        return {
          isWashTrading: true,
          reason: "Multiple buyers from same IP address",
        };
      }
    }

    return { isWashTrading: false };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        bid,
      },
      "Failed to check wash trading"
    );
    return { isWashTrading: false };
  }
}

/**
 * Log audit action (helper function)
 * TODO: Integrate with auditLogService when created
 */
async function logAuditAction(action: string, details: any): Promise<void> {
  // This will be integrated with auditLogService
  logger.info({ action, details }, "Audit action logged");
}

