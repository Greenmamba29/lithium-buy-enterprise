import { type Express, type Request, type Response } from "express";
import { supabaseAdmin } from "../db/client.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { NotFoundError, ValidationError, AuthenticationError } from "../utils/errors.js";
import { requireAuth } from "../middleware/auth.js";
import { executeTransaction, createUpdateRollback } from "../utils/transactions.js";
import { logger } from "../utils/logger.js";
import { z } from "zod";

// Validation schemas
const createQuoteSchema = z.object({
  supplier_id: z.string().uuid(),
  product_id: z.string().uuid().optional(),
  quantity: z.number().int().positive(),
  requested_price: z.number().positive().optional(),
  notes: z.string().optional(),
  expires_at: z.string().datetime().optional(),
});

const acceptQuoteSchema = z.object({
  quote_id: z.string().uuid(),
});

/**
 * POST /api/suppliers/:id/quote
 * Request a quote from a supplier
 */
export const createQuote = asyncHandler(async (req: Request, res: Response) => {
  const { id: supplier_id } = req.params;
  const user_id = (req as any).user?.id; // Will be set by auth middleware

  if (!user_id) {
    throw new AuthenticationError("Authentication required to request quotes");
  }

  const body = createQuoteSchema.parse({
    ...req.body,
    supplier_id,
  });

  // Verify supplier exists
  const { data: supplier, error: supplierError } = await supabaseAdmin
    .from("suppliers")
    .select("id")
    .eq("id", supplier_id)
    .single();

  if (supplierError || !supplier) {
    throw new NotFoundError("Supplier");
  }

  // Create quote
  const { data, error } = await supabaseAdmin
    .from("quotes")
    .insert({
      supplier_id,
      user_id,
      product_id: body.product_id || null,
      quantity: body.quantity,
      requested_price: body.requested_price || null,
      notes: body.notes || null,
      status: "pending",
      expires_at: body.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
    })
    .select()
    .single();

  if (error) {
    throw new ValidationError(`Failed to create quote: ${error.message}`);
  }

  res.status(201).json({ data });
});

/**
 * GET /api/quotes
 * Get user's quotes
 */
export const getUserQuotes = asyncHandler(async (req: Request, res: Response) => {
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new AuthenticationError("Authentication required");
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const status = req.query.status as string | undefined;

  let queryBuilder = supabaseAdmin
    .from("quotes")
    .select(`
      *,
      suppliers(id, name, logo_url, verification_tier),
      products(id, name, product_type, purity_level, price_per_unit)
    `, { count: "exact" })
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    queryBuilder = queryBuilder.eq("status", status);
  }

  const { data, error, count } = await queryBuilder;

  if (error) {
    throw new ValidationError(`Failed to fetch quotes: ${error.message}`);
  }

  res.json({
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
});

/**
 * POST /api/quotes/:id/accept
 * Accept a quote (converts to order)
 */
export const acceptQuote = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new AuthenticationError("Authentication required");
  }

  // Get quote
  const { data: quote, error: quoteError } = await supabaseAdmin
    .from("quotes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (quoteError || !quote) {
    throw new NotFoundError("Quote");
  }

  if (quote.status !== "pending") {
    throw new ValidationError("Quote is not in pending status");
  }

  if (quote.expires_at && new Date(quote.expires_at) < new Date()) {
    throw new ValidationError("Quote has expired");
  }

  // Store original quote data for rollback
  const originalQuoteData = {
    status: quote.status,
  };

  // Use transaction to update quote and create order atomically
  const transactionResult = await executeTransaction([
    {
      description: `Update quote ${id} status to accepted`,
      execute: async () => {
        const { data: updatedQuote, error: updateError } = await supabaseAdmin
          .from("quotes")
          .update({ status: "accepted" })
          .eq("id", id)
          .select()
          .single();

        if (updateError) {
          throw new ValidationError(`Failed to accept quote: ${updateError.message}`);
        }

        return updatedQuote;
      },
      rollback: createUpdateRollback("quotes", id, originalQuoteData),
    },
    {
      description: `Create order from quote ${id}`,
      execute: async () => {
        const { data: order, error: orderError } = await supabaseAdmin
          .from("orders")
          .insert({
            supplier_id: quote.supplier_id,
            user_id: quote.user_id,
            quote_id: quote.id,
            status: "pending",
            total_amount: quote.requested_price || 0, // Should calculate from product price * quantity
            currency: "USD",
            payment_status: "pending",
          })
          .select()
          .single();

        if (orderError) {
          throw new ValidationError(`Failed to create order: ${orderError.message}`);
        }

        return order;
      },
      rollback: async (order: any) => {
        if (order?.id) {
          const { error } = await supabaseAdmin.from("orders").delete().eq("id", order.id);
          if (error) {
            logger.error(
              { orderId: order.id, error: error.message },
              "Failed to rollback order creation"
            );
            throw error;
          }
        }
      },
    },
  ]);

  if (!transactionResult.success) {
    throw transactionResult.error || new ValidationError("Failed to accept quote and create order");
  }

  const [updatedQuote, order] = transactionResult.data as [any, any];

  logger.info(
    { quoteId: id, orderId: order.id, userId: user_id },
    "Quote accepted and order created successfully"
  );

  res.json({
    data: {
      quote: updatedQuote,
      order,
    },
  });
});

/**
 * GET /api/quotes/:id
 * Get quote details
 */
export const getQuoteById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new AuthenticationError("Authentication required");
  }

  const { data, error } = await supabaseAdmin
    .from("quotes")
    .select(`
      *,
      suppliers(id, name, logo_url, verification_tier),
      products(id, name, product_type, purity_level, price_per_unit)
    `)
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (error || !data) {
    throw new NotFoundError("Quote");
  }

  res.json({ data });
});

/**
 * Register quote routes
 */
export function registerQuoteRoutes(app: Express) {
  app.post("/api/suppliers/:id/quote", requireAuth, createQuote);
  app.get("/api/quotes", requireAuth, getUserQuotes);
  app.get("/api/quotes/:id", requireAuth, getQuoteById);
  app.post("/api/quotes/:id/accept", requireAuth, acceptQuote);
}

