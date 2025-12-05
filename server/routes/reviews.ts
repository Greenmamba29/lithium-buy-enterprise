import { type Express, type Request, type Response } from "express";
import { supabaseAdmin } from "../db/client.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { NotFoundError, ValidationError, AuthenticationError } from "../utils/errors.js";
import { optionalAuthenticate } from "../middleware/auth.js";
import { z } from "zod";

// Validation schemas
const createReviewSchema = z.object({
  supplier_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(10).max(2000),
  author: z.string().min(1).max(100),
  company: z.string().max(100).optional(),
  verified_purchase: z.boolean().default(false),
});

/**
 * POST /api/reviews
 * Create a review for a supplier
 */
export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const user_id = (req as any).user?.id;
  const body = createReviewSchema.parse(req.body);

  // Verify supplier exists
  const { data: supplier, error: supplierError } = await supabaseAdmin
    .from("suppliers")
    .select("id")
    .eq("id", body.supplier_id)
    .single();

  if (supplierError || !supplier) {
    throw new NotFoundError("Supplier");
  }

  // Create review
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .insert({
      supplier_id: body.supplier_id,
      user_id: user_id || null,
      rating: body.rating,
      content: body.content,
      author: body.author,
      company: body.company || null,
      verified_purchase: body.verified_purchase,
      helpful_count: 0,
    })
    .select()
    .single();

  if (error) {
    throw new ValidationError(`Failed to create review: ${error.message}`);
  }

  // Update supplier rating and review count
  const { data: reviews } = await supabaseAdmin
    .from("reviews")
    .select("rating")
    .eq("supplier_id", body.supplier_id);

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const reviewCount = reviews.length;

    await supabaseAdmin
      .from("suppliers")
      .update({
        rating: Math.round(avgRating * 100) / 100, // Round to 2 decimal places
        review_count: reviewCount,
      })
      .eq("id", body.supplier_id);
  }

  res.status(201).json({ data });
});

/**
 * POST /api/reviews/:id/helpful
 * Mark a review as helpful
 */
export const markReviewHelpful = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: review, error: reviewError } = await supabaseAdmin
    .from("reviews")
    .select("helpful_count")
    .eq("id", id)
    .single();

  if (reviewError || !review) {
    throw new NotFoundError("Review");
  }

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update({
      helpful_count: (review.helpful_count || 0) + 1,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new ValidationError(`Failed to update review: ${error.message}`);
  }

  res.json({ data });
});

/**
 * Register review routes
 */
export function registerReviewRoutes(app: Express) {
  app.post("/api/reviews", optionalAuthenticate, createReview);
  app.post("/api/reviews/:id/helpful", optionalAuthenticate, markReviewHelpful);
}

