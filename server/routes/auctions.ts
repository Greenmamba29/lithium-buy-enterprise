import { type Express, type Request, type Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/auth.js";
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
 * List active auctions
 */
export const listAuctions = asyncHandler(async (req: Request, res: Response) => {
  const auction_type = req.query.auction_type as string | undefined;
  const product_type = req.query.product_type as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const result = await listActiveAuctions({
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
  const auction = await endAuction(id);
  res.json({ data: auction });
});

/**
 * POST /api/auctions/:id/status
 * Update auction status
 */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["draft", "scheduled", "live", "ended", "cancelled"].includes(status)) {
    throw new Error("Invalid status");
  }

  const auction = await updateAuctionStatus(id, status);
  res.json({ data: auction });
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
 * Register auction routes
 */
export function registerAuctionRoutes(app: Express) {
  app.post("/api/auctions", requireAuth, createAuctionRoute);
  app.get("/api/auctions", listAuctions);
  app.get("/api/auctions/:id", getAuction);
  app.post("/api/auctions/:id/bid", requireAuth, placeBidRoute);
  app.post("/api/auctions/:id/end", requireAuth, endAuctionRoute);
  app.post("/api/auctions/:id/status", requireAuth, updateStatus);

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


