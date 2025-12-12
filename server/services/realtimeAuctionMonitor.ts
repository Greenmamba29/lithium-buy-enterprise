import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { closeAuction } from "./auctionService.js";
import { websocketManager } from "./websocketService.js";

/**
 * Real-Time Auction Monitor
 * Monitors scheduled_end timestamps and auto-closes auctions
 * PRD: Auction closure within ±30 sec of scheduled_end
 */

class RealtimeAuctionMonitor {
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 10000; // Check every 10 seconds
  private readonly CLOSURE_BUFFER_MS = 30000; // 30 seconds buffer for PRD requirement

  /**
   * Start monitoring auctions
   */
  start(): void {
    if (this.checkInterval) {
      logger.warn({}, "Auction monitor already running");
      return;
    }

    logger.info({}, "Starting real-time auction monitor");

    // Check immediately on start
    this.checkAuctions();

    // Then check at regular intervals
    this.checkInterval = setInterval(() => {
      this.checkAuctions();
    }, this.CHECK_INTERVAL_MS);
  }

  /**
   * Stop monitoring auctions
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info({}, "Stopped real-time auction monitor");
    }
  }

  /**
   * Check for auctions that need to be closed
   */
  private async checkAuctions(): Promise<void> {
    try {
      const now = new Date();
      const bufferTime = new Date(now.getTime() + this.CHECK_INTERVAL_MS + this.CLOSURE_BUFFER_MS);

      // Find auctions that should be closed
      // Status must be 'active' and scheduled_end must be within the buffer window
      const { data: auctionsToClose, error } = await supabaseAdmin
        .from("auctions")
        .select("id, scheduled_end, status, auction_number")
        .eq("status", "active")
        .lte("scheduled_end", bufferTime.toISOString())
        .gte("scheduled_end", now.toISOString()); // Only future times (within buffer)

      if (error) {
        logger.error(
          { error: error.message },
          "Failed to fetch auctions to close"
        );
        return;
      }

      if (!auctionsToClose || auctionsToClose.length === 0) {
        return;
      }

      logger.info(
        { count: auctionsToClose.length },
        "Found auctions to close"
      );

      // Close each auction
      for (const auction of auctionsToClose) {
        await this.closeAuctionAtScheduledTime(auction.id, auction.scheduled_end);
      }
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : String(error),
        },
        "Error in auction monitor check"
      );
    }
  }

  /**
   * Close an auction at its scheduled time
   * PRD: Closure within ±30 sec of scheduled_end
   */
  private async closeAuctionAtScheduledTime(
    auctionId: string,
    scheduledEnd: string
  ): Promise<void> {
    try {
      const scheduledTime = new Date(scheduledEnd);
      const now = new Date();
      const timeDiff = scheduledTime.getTime() - now.getTime();

      // If scheduled time is more than 30 seconds away, wait
      if (timeDiff > this.CLOSURE_BUFFER_MS) {
        logger.debug(
          {
            auctionId,
            timeUntilClose: timeDiff,
          },
          "Auction not yet ready to close"
        );
        return;
      }

      // If scheduled time has passed (even by a bit), close immediately
      // This ensures we meet the ±30 sec requirement
      logger.info(
        {
          auctionId,
          scheduledEnd,
          timeDiff,
        },
        "Closing auction at scheduled time"
      );

      // Close the auction
      const closedAuction = await closeAuction(auctionId);

      // Broadcast closure event via WebSocket
      websocketManager.broadcastAuctionClosed(
        auctionId,
        closedAuction.status,
        closedAuction.winning_buyer_id,
        closedAuction.final_price
      );

      logger.info(
        {
          auctionId,
          status: closedAuction.status,
          winnerId: closedAuction.winning_buyer_id,
        },
        "Auction closed successfully"
      );
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          auctionId,
          scheduledEnd,
        },
        "Failed to close auction at scheduled time"
      );
    }
  }

  /**
   * Manually trigger check (useful for testing)
   */
  async triggerCheck(): Promise<void> {
    await this.checkAuctions();
  }
}

export const auctionMonitor = new RealtimeAuctionMonitor();

