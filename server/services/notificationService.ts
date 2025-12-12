import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import {
  sendAuctionLaunchNotification,
  sendBidConfirmation,
  sendOutbidAlert,
  sendAuctionClosedNotification,
  sendSettlementReadyNotification,
} from "./emailService.js";
import { getWatchlist } from "./watchlistService.js";

/**
 * Notification Service
 * PRD: Queue notifications via BullMQ
 * Sent <1 min of event, email deliverability >95%
 */

/**
 * Send auction launch notification to watchlist users
 */
export async function sendAuctionLaunchNotificationToWatchlist(
  auctionId: string,
  auctionTitle: string,
  materialType: string,
  grade: string,
  startingPrice: number,
  scheduledEnd: string
): Promise<void> {
  try {
    // Get all users watching this auction
    const { data: watchlist, error } = await supabaseAdmin
      .from("watchlist")
      .select("buyer_id")
      .eq("auction_id", auctionId);

    if (error) {
      logger.error({ error: error.message, auctionId }, "Failed to get watchlist");
      return;
    }

    if (!watchlist || watchlist.length === 0) {
      return; // No one watching
    }

    // Get user emails
    const userIds = watchlist.map((w) => w.buyer_id);
    const { data: users } = await supabaseAdmin
      .from("auth.users")
      .select("id, email")
      .in("id", userIds);

    if (!users) {
      return;
    }

    // Send notifications to all watching users
    const notifications = users.map((user) =>
      sendAuctionLaunchNotification(
        user.email,
        auctionId,
        auctionTitle,
        materialType,
        grade,
        startingPrice,
        scheduledEnd
      )
    );

    await Promise.all(notifications);

    logger.info(
      {
        auctionId,
        notificationCount: users.length,
      },
      "Auction launch notifications sent"
    );
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
      },
      "Failed to send auction launch notifications"
    );
  }
}

/**
 * Send bid confirmation
 */
export async function sendBidConfirmationNotification(
  userId: string,
  auctionId: string,
  auctionTitle: string,
  bidAmount: number,
  bidRank: number
): Promise<void> {
  try {
    // Get user email
    const { data: user } = await supabaseAdmin
      .from("auth.users")
      .select("email")
      .eq("id", userId)
      .single();

    if (!user?.email) {
      logger.warn({ userId }, "User email not found for bid confirmation");
      return;
    }

    await sendBidConfirmation(user.email, auctionId, auctionTitle, bidAmount, bidRank);

    logger.info({ userId, auctionId, bidAmount }, "Bid confirmation sent");
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        userId,
        auctionId,
      },
      "Failed to send bid confirmation"
    );
  }
}

/**
 * Send outbid alert
 */
export async function sendOutbidAlertNotification(
  userId: string,
  auctionId: string,
  auctionTitle: string,
  yourBid: number,
  newHighestBid: number
): Promise<void> {
  try {
    // Get user email
    const { data: user } = await supabaseAdmin
      .from("auth.users")
      .select("email")
      .eq("id", userId)
      .single();

    if (!user?.email) {
      logger.warn({ userId }, "User email not found for outbid alert");
      return;
    }

    await sendOutbidAlert(user.email, auctionId, auctionTitle, yourBid, newHighestBid);

    logger.info({ userId, auctionId, yourBid, newHighestBid }, "Outbid alert sent");
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        userId,
        auctionId,
      },
      "Failed to send outbid alert"
    );
  }
}

/**
 * Send auction closed notification
 */
export async function sendAuctionClosedNotificationToParticipants(
  auctionId: string,
  auctionTitle: string,
  winnerId: string | null,
  finalPrice: number | null,
  quantity: number | null
): Promise<void> {
  try {
    // Get all bidders for this auction
    const { data: bids } = await supabaseAdmin
      .from("bids")
      .select("bidder_id")
      .eq("auction_id", auctionId)
      .eq("is_retracted", false);

    if (!bids || bids.length === 0) {
      return; // No bidders
    }

    const bidderIds = [...new Set(bids.map((b) => b.bidder_id))];

    // Get user emails
    const { data: users } = await supabaseAdmin
      .from("auth.users")
      .select("id, email")
      .in("id", bidderIds);

    if (!users) {
      return;
    }

    // Send notifications
    const notifications = users.map((user) => {
      const isWinner = user.id === winnerId;
      return sendAuctionClosedNotification(
        user.email,
        auctionId,
        auctionTitle,
        isWinner,
        finalPrice,
        quantity
      );
    });

    await Promise.all(notifications);

    logger.info(
      {
        auctionId,
        winnerId,
        notificationCount: users.length,
      },
      "Auction closed notifications sent"
    );
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        auctionId,
      },
      "Failed to send auction closed notifications"
    );
  }
}

/**
 * Send settlement ready notification
 */
export async function sendSettlementReadyNotificationToWinner(
  userId: string,
  auctionId: string,
  auctionTitle: string,
  contractUrl: string
): Promise<void> {
  try {
    // Get user email
    const { data: user } = await supabaseAdmin
      .from("auth.users")
      .select("email")
      .eq("id", userId)
      .single();

    if (!user?.email) {
      logger.warn({ userId }, "User email not found for settlement notification");
      return;
    }

    await sendSettlementReadyNotification(user.email, auctionId, auctionTitle, contractUrl);

    logger.info({ userId, auctionId, contractUrl }, "Settlement ready notification sent");
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        userId,
        auctionId,
      },
      "Failed to send settlement ready notification"
    );
  }
}

