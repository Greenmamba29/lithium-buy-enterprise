import { type Express, type Request, type Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { AuthorizationError, NotFoundError } from "../utils/errors.js";
import { supabaseAdmin } from "../db/client.js";
import {
  createAuction,
  placeBid,
  getAuctionById,
  listActiveAuctions,
  endAuction,
  updateAuctionStatus,
} from "../services/auctionService.js";
import {
  createEscrowAccount,
  fundEscrow,
  releaseEscrow,
  refundEscrow,
  getEscrowById,
} from "../services/escrowService.js";
import {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  isWatched,
} from "../services/watchlistService.js";
import {
  createLogisticsOption,
  bookLogistics,
  updateLogisticsStatus,
  getLogisticsOptions,
  getAvailableProviders,
} from "../services/logisticsService.js";
import { z } from "zod";

// Validation schemas
const createAuctionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  auction_type: z.enum(["english", "dutch", "sealed_bid", "reverse"]),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  reserve_price: z.number().positive().optional(),
  starting_price: z.number().positive(),
  currency: z.string().optional(),
  bid_increment: z.number().positive().optional(),
  lots: z.array(
    z.object({
      lot_number: z.number().int().positive(),
      title: z.string().min(1),
      description: z.string().optional(),
      quantity: z.number().positive(),
      unit: z.string().optional(),
      product_type: z.enum(["raw", "compound", "processed"]).optional(),
      purity_level: z.enum(["99", "99.5", "99.9"]).optional(),
      location_country: z.string().optional(),
      location_city: z.string().optional(),
    })
  ),
});

const placeBidSchema = z.object({
  amount: z.number().positive(),
  lot_id: z.string().uuid().optional(),
});

/**
 * POST /api/auctions
 * Create a new auction
 */
export const createAuctionRoute = asyncHandler(async (req: Request, res: Response) => {
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  const body = createAuctionSchema.parse(req.body);

  const auction = await createAuction({
    ...body,
    seller_id: user_id,
  });

  res.status(201).json({ data: auction });
});

/**
 * GET /api/auctions
 * List active auctions with PRD filters
 */
export const listAuctions = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  // PRD filters
  const material_type = req.query.material_type as string | undefined;
  const grade = req.query.grade as string | undefined;
  const delivery_terms = req.query.delivery_terms as string | undefined;
  const price_min = req.query.price_min ? parseFloat(req.query.price_min as string) : undefined;
  const price_max = req.query.price_max ? parseFloat(req.query.price_max as string) : undefined;
  const time_remaining = req.query.time_remaining as string | undefined;
  const seller_rating = req.query.seller_rating ? parseFloat(req.query.seller_rating as string) : undefined;
  const sort_by = req.query.sort_by as "price" | "time_remaining" | "created_at" | undefined;
  const sort_order = req.query.sort_order as "asc" | "desc" | undefined;

  // Legacy filters (backward compatibility)
  const auction_type = req.query.auction_type as string | undefined;
  const product_type = req.query.product_type as string | undefined;

  const result = await listActiveAuctions({
    // PRD filters
    material_type,
    grade,
    delivery_terms,
    price_min,
    price_max,
    time_remaining,
    seller_rating,
    sort_by,
    sort_order,
    // Legacy filters
    auction_type,
    product_type,
    limit,
    offset,
  });

  res.json({
    data: result.data,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  });
});

/**
 * GET /api/auctions/:id
 * Get auction details
 */
export const getAuction = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const auction = await getAuctionById(id);
  res.json({ data: auction });
});

/**
 * POST /api/auctions/:id/bid
 * Place a bid on an auction
 */
export const placeBidRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id: auctionId } = req.params;
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  const body = placeBidSchema.parse(req.body);

  const result = await placeBid(auctionId, user_id, body.amount, body.lot_id);

  res.json({ data: result });
});

/**
 * POST /api/auctions/:id/end
 * End an auction (admin or seller only)
 */
export const endAuctionRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = (req as any).user?.id;
  const user_role = (req as any).user?.role;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  // Get auction to verify ownership
  const { data: auction, error } = await supabaseAdmin
    .from("auctions")
    .select("seller_id")
    .eq("id", id)
    .single();

  if (error || !auction) {
    throw new NotFoundError("Auction");
  }

  // Verify user is seller or admin
  if (auction.seller_id !== user_id && user_role !== "admin") {
    throw new AuthorizationError("Only the auction seller or an admin can end this auction");
  }

  const endedAuction = await endAuction(id);
  res.json({ data: endedAuction });
});

/**
 * POST /api/auctions/:id/status
 * Update auction status (admin or seller only)
 */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const user_id = (req as any).user?.id;
  const user_role = (req as any).user?.role;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  if (!["draft", "scheduled", "live", "ended", "cancelled"].includes(status)) {
    throw new Error("Invalid status");
  }

  // Get auction to verify ownership
  const { data: auction, error } = await supabaseAdmin
    .from("auctions")
    .select("seller_id")
    .eq("id", id)
    .single();

  if (error || !auction) {
    throw new NotFoundError("Auction");
  }

  // Verify user is seller or admin
  if (auction.seller_id !== user_id && user_role !== "admin") {
    throw new AuthorizationError("Only the auction seller or an admin can update this auction's status");
  }

  const updatedAuction = await updateAuctionStatus(id, status);
  res.json({ data: updatedAuction });
});

/**
 * POST /api/escrow
 * Create escrow account
 */
export const createEscrow = asyncHandler(async (req: Request, res: Response) => {
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  const { auction_id, order_id, seller_id, amount, currency } = req.body;

  if (!seller_id || !amount) {
    throw new Error("seller_id and amount are required");
  }

  const escrow = await createEscrowAccount({
    auction_id,
    order_id,
    buyer_id: user_id,
    seller_id,
    amount,
    currency,
  });

  res.status(201).json({ data: escrow });
});

/**
 * POST /api/escrow/:id/fund
 * Fund escrow account
 */
export const fundEscrowRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { stripe_payment_intent_id } = req.body;

  if (!stripe_payment_intent_id) {
    throw new Error("stripe_payment_intent_id is required");
  }

  const escrow = await fundEscrow(id, stripe_payment_intent_id);
  res.json({ data: escrow });
});

/**
 * POST /api/escrow/:id/release
 * Release escrow to seller
 */
export const releaseEscrowRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const escrow = await releaseEscrow(id);
  res.json({ data: escrow });
});

/**
 * POST /api/escrow/:id/refund
 * Refund escrow to buyer
 */
export const refundEscrowRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const escrow = await refundEscrow(id, reason);
  res.json({ data: escrow });
});

/**
 * GET /api/escrow/:id
 * Get escrow account details
 */
export const getEscrow = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const escrow = await getEscrowById(id);
  res.json({ data: escrow });
});

/**
 * POST /api/logistics
 * Create logistics option
 */
export const createLogistics = asyncHandler(async (req: Request, res: Response) => {
  const { auction_id, order_id, option } = req.body;

  const logistics = await createLogisticsOption({
    auction_id,
    order_id,
    option,
  });

  res.status(201).json({ data: logistics });
});

/**
 * POST /api/logistics/:id/book
 * Book logistics
 */
export const bookLogisticsRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tracking_number } = req.body;

  const logistics = await bookLogistics(id, tracking_number);
  res.json({ data: logistics });
});

/**
 * POST /api/logistics/:id/status
 * Update logistics status
 */
export const updateLogisticsStatusRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "booked", "in_transit", "delivered", "cancelled"].includes(status)) {
    throw new Error("Invalid status");
  }

  const logistics = await updateLogisticsStatus(id, status);
  res.json({ data: logistics });
});

/**
 * GET /api/logistics
 * Get logistics options
 */
export const getLogistics = asyncHandler(async (req: Request, res: Response) => {
  const { auction_id, order_id } = req.query;

  const options = await getLogisticsOptions({
    auction_id: auction_id as string | undefined,
    order_id: order_id as string | undefined,
  });

  res.json({ data: options });
});

/**
 * GET /api/logistics/providers
 * Get available logistics providers
 */
export const getProviders = asyncHandler(async (req: Request, res: Response) => {
  const { origin_country, origin_city, destination_country, destination_city } = req.query;

  if (!origin_country || !destination_country) {
    throw new Error("origin_country and destination_country are required");
  }

  const providers = await getAvailableProviders(
    {
      country: origin_country as string,
      city: origin_city as string | undefined,
    },
    {
      country: destination_country as string,
      city: destination_city as string | undefined,
    }
  );

  res.json({ data: providers });
});

/**
 * POST /api/auctions/:id/watchlist
 * Add auction to watchlist
 */
export const addToWatchlistRoute = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const auctionId = req.params.id;

  if (!userId) {
    throw new AuthorizationError("Authentication required");
  }

  const result = await addToWatchlist(userId, auctionId);
  res.json({ data: result });
});

/**
 * DELETE /api/auctions/:id/watchlist
 * Remove auction from watchlist
 */
export const removeFromWatchlistRoute = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const auctionId = req.params.id;

  if (!userId) {
    throw new AuthorizationError("Authentication required");
  }

  await removeFromWatchlist(userId, auctionId);
  res.json({ success: true });
});

/**
 * GET /api/watchlist
 * Get user's watchlist
 */
export const getWatchlistRoute = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new AuthorizationError("Authentication required");
  }

  const watchlist = await getWatchlist(userId);
  res.json({ data: watchlist });
});

/**
 * GET /api/auctions/:id/watchlist
 * Check if auction is in watchlist
 */
export const checkWatchlistRoute = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const auctionId = req.params.id;

  if (!userId) {
    throw new AuthorizationError("Authentication required");
  }

  const isWatchedResult = await isWatched(userId, auctionId);
  res.json({ is_watched: isWatchedResult });
});

/**
 * Register auction routes
 */
export function registerAuctionRoutes(app: Express) {
  app.post("/api/auctions", requireAuth, createAuctionRoute);
  app.get("/api/auctions", listAuctions);
  app.get("/api/auctions/:id", getAuction);
  app.post("/api/auctions/:id/bid", requireAuth, placeBidRoute);
  app.post("/api/auctions/:id/end", requireAuth, endAuctionRoute);
  app.post("/api/auctions/:id/status", requireAuth, updateStatus);

  // Watchlist routes
  app.post("/api/auctions/:id/watchlist", requireAuth, addToWatchlistRoute);
  app.delete("/api/auctions/:id/watchlist", requireAuth, removeFromWatchlistRoute);
  app.get("/api/watchlist", requireAuth, getWatchlistRoute);
  app.get("/api/auctions/:id/watchlist", requireAuth, checkWatchlistRoute);

  app.post("/api/escrow", requireAuth, createEscrow);
  app.post("/api/escrow/:id/fund", requireAuth, fundEscrowRoute);
  app.post("/api/escrow/:id/release", requireAuth, releaseEscrowRoute);
  app.post("/api/escrow/:id/refund", requireAuth, refundEscrowRoute);
  app.get("/api/escrow/:id", requireAuth, getEscrow);

  app.post("/api/logistics", requireAuth, createLogistics);
  app.post("/api/logistics/:id/book", requireAuth, bookLogisticsRoute);
  app.post("/api/logistics/:id/status", requireAuth, updateLogisticsStatusRoute);
  app.get("/api/logistics", getLogistics);
  app.get("/api/logistics/providers", getProviders);
}


