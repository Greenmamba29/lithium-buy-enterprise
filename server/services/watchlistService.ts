import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { NotFoundError } from "../utils/errors.js";

/**
 * Watchlist Service
 * Manages buyer watchlists for auctions
 */

/**
 * Add auction to watchlist
 */
export async function addToWatchlist(userId: string, auctionId: string): Promise<any> {
  try {
    // Check if already in watchlist
    const { data: existing } = await supabaseAdmin
      .from("watchlist")
      .select("id")
      .eq("buyer_id", userId)
      .eq("auction_id", auctionId)
      .single();

    if (existing) {
      return existing; // Already in watchlist
    }

    const { data, error } = await supabaseAdmin
      .from("watchlist")
      .insert({
        buyer_id: userId,
        auction_id: auctionId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add to watchlist: ${error.message}`);
    }

    logger.info({ userId, auctionId }, "Auction added to watchlist");

    return data;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        userId,
        auctionId,
      },
      "Failed to add to watchlist"
    );
    throw error;
  }
}

/**
 * Remove auction from watchlist
 */
export async function removeFromWatchlist(userId: string, auctionId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from("watchlist")
      .delete()
      .eq("buyer_id", userId)
      .eq("auction_id", auctionId);

    if (error) {
      throw new Error(`Failed to remove from watchlist: ${error.message}`);
    }

    logger.info({ userId, auctionId }, "Auction removed from watchlist");
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        userId,
        auctionId,
      },
      "Failed to remove from watchlist"
    );
    throw error;
  }
}

/**
 * Get user's watchlist
 */
export async function getWatchlist(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("watchlist")
      .select(`
        *,
        auction:auctions(*)
      `)
      .eq("buyer_id", userId)
      .order("added_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get watchlist: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        userId,
      },
      "Failed to get watchlist"
    );
    throw error;
  }
}

/**
 * Check if auction is in user's watchlist
 */
export async function isWatched(userId: string, auctionId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from("watchlist")
      .select("id")
      .eq("buyer_id", userId)
      .eq("auction_id", auctionId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      throw new Error(`Failed to check watchlist: ${error.message}`);
    }

    return !!data;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        userId,
        auctionId,
      },
      "Failed to check if watched"
    );
    return false;
  }
}

