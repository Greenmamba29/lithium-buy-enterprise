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
   */
  private async handleMessage(ws: WebSocket, data: any): Promise<void> {
    const client = this.clients.get(ws);
    if (!client) return;

    switch (data.type) {
      case "subscribe":
        await this.handleSubscribe(ws, data.channel, data.userId);
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
        (payload) => {
          this.broadcastToChannel(`auction:${auctionId}`, {
            type: "auction_update",
            data: payload,
          });
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
        (payload) => {
          this.broadcastToChannel(`auction:${auctionId}`, {
            type: "new_bid",
            data: payload,
          });
        }
      )
      .subscribe();

    // Store channel reference for cleanup
    (ws as any).supabaseChannels = (ws as any).supabaseChannels || [];
    (ws as any).supabaseChannels.push(channel);
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
   */
  broadcastToChannel(channel: string, message: any): void {
    const subscribers = this.subscriptions.get(channel);
    if (!subscribers) return;

    const messageStr = JSON.stringify(message);
    subscribers.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
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
