import { WebSocketServer, WebSocket } from "ws";
import { logger } from "../utils/logger.js";
import { supabaseAdmin } from "../db/client.js";

/**
 * WebSocket Service
 * Handles real-time updates for auctions, bids, prices, and other live data
 */

interface WebSocketClient {
  ws: WebSocket;
  userId?: string;
  subscriptions: Set<string>;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, WebSocketClient> = new Map();
  private subscriptions: Map<string, Set<WebSocket>> = new Map();

  /**
   * Initialize WebSocket server
   */
  initialize(server: any) {
    this.wss = new WebSocketServer({ server, path: "/ws" });

    this.wss.on("connection", (ws: WebSocket, req) => {
      logger.info({}, "WebSocket client connected");

      const client: WebSocketClient = {
        ws,
        subscriptions: new Set(),
      };
      this.clients.set(ws, client);

      ws.on("message", async (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          await this.handleMessage(ws, data);
        } catch (error) {
          logger.error(
            {
              error: error instanceof Error ? error.message : String(error),
            },
            "Failed to handle WebSocket message"
          );
          this.sendError(ws, "Invalid message format");
        }
      });

      ws.on("close", () => {
        this.handleDisconnect(ws);
      });

      ws.on("error", (error) => {
        logger.error({ error: error.message }, "WebSocket error");
        this.handleDisconnect(ws);
      });

      // Send welcome message
      this.send(ws, {
        type: "connected",
        message: "WebSocket connection established",
      });
    });

    logger.info({}, "WebSocket server initialized");
  }

  /**
   * Handle incoming WebSocket messages
   * PRD: Supports subscribe_auction event type
   */
  private async handleMessage(ws: WebSocket, data: any): Promise<void> {
    const client = this.clients.get(ws);
    if (!client) return;

    switch (data.type) {
      case "subscribe":
        await this.handleSubscribe(ws, data.channel, data.userId);
        break;
      case "subscribe_auction": // PRD event type
        await this.handleSubscribe(ws, `auction:${data.auction_id}`, data.userId);
        break;
      case "unsubscribe":
        this.handleUnsubscribe(ws, data.channel);
        break;
      case "authenticate":
        await this.handleAuthenticate(ws, data.token);
        break;
      default:
        this.sendError(ws, `Unknown message type: ${data.type}`);
    }
  }

  /**
   * Handle subscription
   */
  private async handleSubscribe(ws: WebSocket, channel: string, userId?: string): Promise<void> {
    const client = this.clients.get(ws);
    if (!client) return;

    // Validate channel access if userId provided
    if (userId && channel.startsWith("user:")) {
      if (client.userId !== userId) {
        this.sendError(ws, "Unauthorized subscription");
        return;
      }
    }

    client.subscriptions.add(channel);

    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(ws);

    // Set up Supabase Realtime subscription for database changes
    if (channel.startsWith("auction:")) {
      const auctionId = channel.split(":")[1];
      await this.subscribeToAuction(auctionId, ws);
    } else if (channel === "prices") {
      await this.subscribeToPrices(ws);
    } else if (channel === "arbitrage") {
      await this.subscribeToArbitrage(ws);
    }

    this.send(ws, {
      type: "subscribed",
      channel,
    });

    logger.info({ channel, userId: client.userId }, "Client subscribed to channel");
  }

  /**
   * Handle unsubscription
   */
  private handleUnsubscribe(ws: WebSocket, channel: string): void {
    const client = this.clients.get(ws);
    if (!client) return;

    client.subscriptions.delete(channel);
    this.subscriptions.get(channel)?.delete(ws);

    this.send(ws, {
      type: "unsubscribed",
      channel,
    });
  }

  /**
   * Handle authentication
   */
  private async handleAuthenticate(ws: WebSocket, token: string): Promise<void> {
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        this.sendError(ws, "Invalid authentication token");
        return;
      }

      const client = this.clients.get(ws);
      if (client) {
        client.userId = user.id;
      }

      this.send(ws, {
        type: "authenticated",
        userId: user.id,
      });

      logger.info({ userId: user.id }, "WebSocket client authenticated");
    } catch (error) {
      this.sendError(ws, "Authentication failed");
    }
  }

  /**
   * Subscribe to auction updates via Supabase Realtime
   * PRD: Enhanced with bid ranking, outbid notifications, and auction closure events
   */
  private async subscribeToAuction(auctionId: string, ws: WebSocket): Promise<void> {
    const channel = supabaseAdmin
      .channel(`auction-${auctionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "auctions",
          filter: `id=eq.${auctionId}`,
        },
        async (payload) => {
          // Check if auction was closed
          if (payload.new?.status === "closed" || payload.new?.status === "completed") {
            // Fetch winner details
            const { data: auction } = await supabaseAdmin
              .from("auctions")
              .select("winning_bid_id, winning_buyer_id, final_price")
              .eq("id", auctionId)
              .single();

            this.broadcastToChannel(`auction:${auctionId}`, {
              type: "auction_closed", // PRD event type
              auction_id: auctionId,
              status: payload.new.status,
              winning_buyer_id: auction?.winning_buyer_id || null,
              final_price: auction?.final_price || null,
              data: payload,
            });
          } else {
            this.broadcastToChannel(`auction:${auctionId}`, {
              type: "auction_update",
              data: payload,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `auction_id=eq.${auctionId}`,
        },
        async (payload) => {
          // Fetch bid ranking and buyer info
          const { data: bidHistory } = await supabaseAdmin
            .from("bid_history")
            .select("rank_at_time")
            .eq("bid_id", payload.new.id)
            .eq("status_change", "placed")
            .order("timestamp", { ascending: false })
            .limit(1)
            .single();

          const { data: buyer } = await supabaseAdmin
            .from("auth.users")
            .select("id, email")
            .eq("id", payload.new.bidder_id)
            .single();

          // PRD: new_bid event with buyer rank
          this.broadcastToChannel(`auction:${auctionId}`, {
            type: "new_bid", // PRD event type
            bid_id: payload.new.id,
            buyer_id: payload.new.bidder_id,
            buyer_rank: bidHistory?.rank_at_time || null,
            new_highest_bid: payload.new.amount,
            data: payload,
          });

          // Check for outbid bids and notify
          await this.notifyOutbidBids(auctionId, payload.new.id, payload.new.amount);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bids",
          filter: `auction_id=eq.${auctionId}`,
        },
        async (payload) => {
          // Check if bid was withdrawn
          if (payload.new.is_retracted && !payload.old.is_retracted) {
            this.broadcastToChannel(`auction:${auctionId}`, {
              type: "bid_withdrawn", // PRD event type
              bid_id: payload.new.id,
              old_bid_id: payload.new.id,
              new_highest_bid: await this.getCurrentHighestBid(auctionId),
              data: payload,
            });
          }
        }
      )
      .subscribe();

    // Store channel reference for cleanup
    (ws as any).supabaseChannels = (ws as any).supabaseChannels || [];
    (ws as any).supabaseChannels.push(channel);
  }

  /**
   * Get current highest bid for an auction
   */
  private async getCurrentHighestBid(auctionId: string): Promise<number | null> {
    const { data: auction } = await supabaseAdmin
      .from("auctions")
      .select("current_bid")
      .eq("id", auctionId)
      .single();

    return auction?.current_bid || null;
  }

  /**
   * Notify users whose bids were outbid
   * PRD: Outbid notifications <10 sec
   */
  private async notifyOutbidBids(
    auctionId: string,
    newBidId: string,
    newBidAmount: number
  ): Promise<void> {
    try {
      // Get all bids that are now outbid (amount < new bid, not retracted, not the new bid)
      const { data: outbidBids } = await supabaseAdmin
        .from("bids")
        .select("id, bidder_id, amount")
        .eq("auction_id", auctionId)
        .eq("is_retracted", false)
        .neq("id", newBidId)
        .lt("amount", newBidAmount);

      if (!outbidBids || outbidBids.length === 0) {
        return;
      }

      // Notify each outbid buyer
      for (const bid of outbidBids) {
        this.broadcastToChannel(`user:${bid.bidder_id}`, {
          type: "outbid", // PRD: outbid alert
          auction_id: auctionId,
          bid_id: bid.id,
          your_bid: bid.amount,
          new_highest_bid: newBidAmount,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          auctionId,
          newBidId,
        },
        "Failed to notify outbid bids"
      );
    }
  }

  /**
   * Subscribe to price updates
   */
  private async subscribeToPrices(ws: WebSocket): Promise<void> {
    const channel = supabaseAdmin
      .channel("prices")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "price_data",
        },
        (payload) => {
          this.broadcastToChannel("prices", {
            type: "price_update",
            data: payload,
          });
        }
      )
      .subscribe();

    (ws as any).supabaseChannels = (ws as any).supabaseChannels || [];
    (ws as any).supabaseChannels.push(channel);
  }

  /**
   * Subscribe to arbitrage opportunities
   */
  private async subscribeToArbitrage(ws: WebSocket): Promise<void> {
    const channel = supabaseAdmin
      .channel("arbitrage")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "arbitrage_opportunities",
          filter: "status=eq.active",
        },
        (payload) => {
          this.broadcastToChannel("arbitrage", {
            type: "new_opportunity",
            data: payload,
          });
        }
      )
      .subscribe();

    (ws as any).supabaseChannels = (ws as any).supabaseChannels || [];
    (ws as any).supabaseChannels.push(channel);
  }

  /**
   * Broadcast message to all clients subscribed to a channel
   * PRD: Ensures <2 second latency for bid updates
   */
  broadcastToChannel(channel: string, message: any): void {
    const subscribers = this.subscriptions.get(channel);
    if (!subscribers) return;

    const messageStr = JSON.stringify(message);
    const startTime = Date.now();

    subscribers.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr);
          const latency = Date.now() - startTime;
          
          // Log if latency exceeds PRD requirement (<2 sec)
          if (latency > 2000) {
            logger.warn(
              { channel, latency, messageType: message.type },
              "WebSocket broadcast latency exceeds PRD requirement"
            );
          }
        } catch (error) {
          logger.error(
            {
              error: error instanceof Error ? error.message : String(error),
              channel,
            },
            "Failed to send WebSocket message"
          );
        }
      }
    });
  }

  /**
   * Broadcast new bid event (called from auction service)
   * PRD: Public method for triggering new_bid events
   */
  async broadcastNewBid(
    auctionId: string,
    bidId: string,
    buyerId: string,
    buyerRank: number,
    newHighestBid: number
  ): Promise<void> {
    this.broadcastToChannel(`auction:${auctionId}`, {
      type: "new_bid",
      bid_id: bidId,
      buyer_id: buyerId,
      buyer_rank: buyerRank,
      new_highest_bid: newHighestBid,
      timestamp: new Date().toISOString(),
    });

    // Trigger outbid notifications
    await this.notifyOutbidBids(auctionId, bidId, newHighestBid);
  }

  /**
   * Broadcast auction closed event (called from auction service)
   * PRD: Public method for triggering auction_closed events
   */
  broadcastAuctionClosed(
    auctionId: string,
    status: string,
    winningBuyerId: string | null,
    finalPrice: number | null
  ): void {
    this.broadcastToChannel(`auction:${auctionId}`, {
      type: "auction_closed",
      auction_id: auctionId,
      status,
      winning_buyer_id: winningBuyerId,
      final_price: finalPrice,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send message to specific client
   */
  private send(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send error to client
   */
  private sendError(ws: WebSocket, error: string): void {
    this.send(ws, {
      type: "error",
      message: error,
    });
  }

  /**
   * Handle client disconnect
   */
  private handleDisconnect(ws: WebSocket): void {
    const client = this.clients.get(ws);
    if (client) {
      // Unsubscribe from all Supabase channels
      if ((ws as any).supabaseChannels) {
        (ws as any).supabaseChannels.forEach((channel: any) => {
          channel.unsubscribe();
        });
      }

      // Remove from all subscriptions
      client.subscriptions.forEach((channel) => {
        this.subscriptions.get(channel)?.delete(ws);
      });

      this.clients.delete(ws);
      logger.info({ userId: client.userId }, "WebSocket client disconnected");
    }
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.clients.size;
  }
}

export const websocketManager = new WebSocketManager();
