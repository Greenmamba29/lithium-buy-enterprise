import { type Express, type Request, type Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { AuthorizationError } from "../utils/errors.js";
import {
  createRFQ,
  publishRFQ,
  getRFQById,
  listRFQs,
  submitRFQResponse,
  getRFQResponses,
  awardRFQ,
  getMatchingSuppliers,
} from "../services/rfqService.js";
import {
  createContractFromRFQ,
  getContractById,
  listContracts,
} from "../services/procurementService.js";
import { supabaseAdmin } from "../db/client.js";
import { z } from "zod";

// Validation schemas
const createRFQSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  product_type: z.enum(["raw", "compound", "processed"]),
  purity_level: z.enum(["99", "99.5", "99.9"]),
  quantity: z.number().positive(),
  unit: z.string().optional(),
  target_price: z.number().positive().optional(),
  currency: z.string().optional(),
  delivery_location_country: z.string().min(1),
  delivery_location_city: z.string().optional(),
  required_certifications: z.array(z.string()).optional(),
  deadline: z.string().datetime(),
});

const submitResponseSchema = z.object({
  supplier_id: z.string().uuid(),
  quote_price: z.number().positive(),
  currency: z.string().optional(),
  delivery_time_days: z.number().int().positive().optional(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * POST /api/rfq
 * Create a new RFQ
 */
export const createRFQRoute = asyncHandler(async (req: Request, res: Response) => {
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  const body = createRFQSchema.parse(req.body);

  const rfq = await createRFQ({
    ...body,
    buyer_id: user_id,
  });

  res.status(201).json({ data: rfq });
});

/**
 * GET /api/rfq
 * List RFQs
 */
export const listRFQsRoute = asyncHandler(async (req: Request, res: Response) => {
  const user_id = (req as any).user?.id;
  const user_role = (req as any).user?.role;
  const status = req.query.status as string | undefined;
  const product_type = req.query.product_type as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const result = await listRFQs({
    buyer_id: user_role === "buyer" ? user_id : undefined,
    status,
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
 * GET /api/rfq/:id
 * Get RFQ details
 */
export const getRFQ = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = (req as any).user?.id;

  const rfq = await getRFQById(id, user_id);
  res.json({ data: rfq });
});

/**
 * POST /api/rfq/:id/publish
 * Publish an RFQ
 */
export const publishRFQRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  const rfq = await publishRFQ(id, user_id);
  res.json({ data: rfq });
});

/**
 * POST /api/rfq/:id/response
 * Submit RFQ response (supplier)
 */
export const submitResponse = asyncHandler(async (req: Request, res: Response) => {
  const { id: rfqId } = req.params;
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  const body = submitResponseSchema.parse(req.body);

  const response = await submitRFQResponse(
    rfqId,
    body.supplier_id,
    user_id,
    {
      quote_price: body.quote_price,
      currency: body.currency,
      delivery_time_days: body.delivery_time_days,
      payment_terms: body.payment_terms,
      notes: body.notes,
    }
  );

  res.status(201).json({ data: response });
});

/**
 * GET /api/rfq/:id/responses
 * Get RFQ responses (buyer only)
 */
export const getResponses = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  const responses = await getRFQResponses(id, user_id);
  res.json({ data: responses });
});

/**
 * POST /api/rfq/:id/award
 * Award RFQ to a supplier
 */
export const awardRFQRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { response_id } = req.body;
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  if (!response_id) {
    throw new Error("response_id is required");
  }

  const result = await awardRFQ(id, response_id, user_id);
  res.json({ data: result });
});

/**
 * GET /api/rfq/:id/matching-suppliers
 * Get supplier matching suggestions
 */
export const getMatchingSuppliersRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const suppliers = await getMatchingSuppliers(id);
  res.json({ data: suppliers });
});

/**
 * POST /api/rfq/:id/contract
 * Create contract from awarded RFQ
 */
export const createContractRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id: rfqId } = req.params;
  const { response_id } = req.body;
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  if (!response_id) {
    throw new Error("response_id is required");
  }

  const contract = await createContractFromRFQ(rfqId, response_id, user_id);
  res.status(201).json({ data: contract });
});

/**
 * GET /api/contracts
 * List contracts
 */
export const listContractsRoute = asyncHandler(async (req: Request, res: Response) => {
  const user_id = (req as any).user?.id;
  const user_role = (req as any).user?.role;
  const status = req.query.status as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  // Determine filters based on user role
  const filters: any = {
    status,
    limit,
    offset,
  };

  if (user_role === "buyer") {
    filters.buyer_id = user_id;
  } else if (user_role === "supplier") {
    // Get supplier_id from suppliers table (assuming user_id links to supplier)
    // Note: This assumes suppliers table has a user_id field or we need to join through user_profiles
    // For now, we'll filter by buyer_id being null and let RLS handle supplier access
    // In a real implementation, you'd need to map user to supplier properly
  }

  const result = await listContracts(filters);

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
 * GET /api/contracts/:id
 * Get contract details
 */
export const getContract = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  const contract = await getContractById(id, user_id);
  res.json({ data: contract });
});

/**
 * Register RFQ routes
 */
export function registerRFQRoutes(app: Express) {
  app.post("/api/rfq", requireAuth, createRFQRoute);
  app.get("/api/rfq", requireAuth, listRFQsRoute);
  app.get("/api/rfq/:id", requireAuth, getRFQ);
  app.post("/api/rfq/:id/publish", requireAuth, publishRFQRoute);
  app.post("/api/rfq/:id/response", requireAuth, submitResponse);
  app.get("/api/rfq/:id/responses", requireAuth, getResponses);
  app.post("/api/rfq/:id/award", requireAuth, awardRFQRoute);
  app.get("/api/rfq/:id/matching-suppliers", requireAuth, getMatchingSuppliersRoute);
  app.post("/api/rfq/:id/contract", requireAuth, createContractRoute);
  app.get("/api/contracts", requireAuth, listContractsRoute);
  app.get("/api/contracts/:id", requireAuth, getContract);
}
