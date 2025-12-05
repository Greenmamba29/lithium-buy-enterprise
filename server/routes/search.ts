import { type Express, type Request, type Response } from "express";
import { supabaseAdmin } from "../db/client.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { ValidationError } from "../utils/errors.js";
import { z } from "zod";

// Validation schema
const searchQuerySchema = z.object({
  q: z.string().min(1),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  type: z.enum(["suppliers", "products", "all"]).optional().default("all"),
});

/**
 * GET /api/search
 * Full-text search across suppliers and products
 */
export const search = asyncHandler(async (req: Request, res: Response) => {
  const query = searchQuerySchema.parse(req.query);
  const { q, page = 1, limit = 20, type = "all" } = query;
  const offset = (page - 1) * limit;

  const results: any = {
    suppliers: [],
    products: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
  };

  // Search suppliers
  if (type === "all" || type === "suppliers") {
    const { data: suppliers, error: suppliersError, count: suppliersCount } = await supabaseAdmin
      .from("suppliers")
      .select(`
        *,
        supplier_profiles(description),
        locations(country, city)
      `, { count: "exact" })
      .or(`name.ilike.%${q}%,supplier_profiles.description.ilike.%${q}%`)
      .order("rating", { ascending: false })
      .range(offset, offset + limit - 1);

    if (!suppliersError) {
      results.suppliers = suppliers || [];
      results.pagination.total += suppliersCount || 0;
    }
  }

  // Search products
  if (type === "all" || type === "products") {
    const { data: products, error: productsError, count: productsCount } = await supabaseAdmin
      .from("products")
      .select(`
        *,
        suppliers(id, name, logo_url, verification_tier)
      `, { count: "exact" })
      .ilike("name", `%${q}%`)
      .order("price_per_unit", { ascending: true })
      .range(offset, offset + limit - 1);

    if (!productsError) {
      results.products = products || [];
      results.pagination.total += productsCount || 0;
    }
  }

  results.pagination.totalPages = Math.ceil(results.pagination.total / limit);

  res.json({ data: results });
});

/**
 * Register search routes
 */
export function registerSearchRoutes(app: Express) {
  app.get("/api/search", search);
}



