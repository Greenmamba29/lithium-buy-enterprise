import { type Express, type Request, type Response } from "express";
import { supabaseAdmin } from "../db/client.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { z } from "zod";

// Validation schemas
const supplierQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  productType: z.enum(["raw", "compound", "processed"]).optional(),
  purityLevel: z.enum(["99", "99.5", "99.9"]).optional(),
  verificationTier: z.enum(["gold", "silver", "bronze"]).optional(),
  location: z.string().optional(),
  minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  search: z.string().optional(),
  sortBy: z.enum(["rating", "price-asc", "price-desc", "newest"]).optional().default("rating"),
});

/**
 * GET /api/suppliers
 * List suppliers with filtering, pagination, and search
 */
export const getSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const query = supplierQuerySchema.parse(req.query);
  const { page = 1, limit = 20 } = query;
  const offset = (page - 1) * limit;

  let queryBuilder = supabaseAdmin
    .from("suppliers")
    .select(`
      *,
      supplier_profiles(*),
      locations(*),
      products(*),
      certifications(*)
    `, { count: "exact" });

  // Apply filters
  if (query.verificationTier) {
    queryBuilder = queryBuilder.eq("verification_tier", query.verificationTier);
  }

  if (query.search) {
    // Full-text search on supplier name
    queryBuilder = queryBuilder.ilike("name", `%${query.search}%`);
  }

  // Apply sorting
  switch (query.sortBy) {
    case "rating":
      queryBuilder = queryBuilder.order("rating", { ascending: false });
      break;
    case "price-asc":
      // This would require joining with products, handled in service layer
      queryBuilder = queryBuilder.order("created_at", { ascending: false });
      break;
    case "price-desc":
      queryBuilder = queryBuilder.order("created_at", { ascending: false });
      break;
    case "newest":
      queryBuilder = queryBuilder.order("created_at", { ascending: false });
      break;
  }

  // Apply pagination
  queryBuilder = queryBuilder.range(offset, offset + limit - 1);

  const { data, error, count } = await queryBuilder;

  if (error) {
    throw new ValidationError(`Failed to fetch suppliers: ${error.message}`);
  }

  // Filter by product type and purity if specified
  let filteredData = data || [];
  if (query.productType || query.purityLevel) {
    filteredData = filteredData.filter((supplier: any) => {
      const products = supplier.products || [];
      return products.some((product: any) => {
        if (query.productType && product.product_type !== query.productType) return false;
        if (query.purityLevel && product.purity_level !== query.purityLevel) return false;
        if (query.minPrice && product.price_per_unit < query.minPrice) return false;
        if (query.maxPrice && product.price_per_unit > query.maxPrice) return false;
        return true;
      });
    });
  }

  // Filter by location if specified
  if (query.location) {
    filteredData = filteredData.filter((supplier: any) => {
      const locations = supplier.locations || [];
      return locations.some((loc: any) => 
        loc.country?.toLowerCase().includes(query.location!.toLowerCase()) ||
        loc.city?.toLowerCase().includes(query.location!.toLowerCase())
      );
    });
  }

  res.json({
    data: filteredData,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
});

/**
 * GET /api/suppliers/:id
 * Get supplier details by ID
 */
export const getSupplierById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .select(`
      *,
      supplier_profiles(*),
      locations(*),
      products(*),
      certifications(*),
      reviews(*)
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new NotFoundError("Supplier");
  }

  res.json({ data });
});

/**
 * GET /api/suppliers/:id/products
 * Get products for a specific supplier
 */
export const getSupplierProducts = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("supplier_id", id)
    .order("price_per_unit", { ascending: true });

  if (error) {
    throw new ValidationError(`Failed to fetch products: ${error.message}`);
  }

  res.json({ data: data || [] });
});

/**
 * GET /api/suppliers/:id/reviews
 * Get reviews for a specific supplier
 */
export const getSupplierReviews = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from("reviews")
    .select("*", { count: "exact" })
    .eq("supplier_id", id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new ValidationError(`Failed to fetch reviews: ${error.message}`);
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
 * Register supplier routes
 */
export function registerSupplierRoutes(app: Express) {
  app.get("/api/suppliers", getSuppliers);
  app.get("/api/suppliers/:id", getSupplierById);
  app.get("/api/suppliers/:id/products", getSupplierProducts);
  app.get("/api/suppliers/:id/reviews", getSupplierReviews);
}




