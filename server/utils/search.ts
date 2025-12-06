import { supabaseAdmin } from "../db/client.js";
import { logger } from "./logger.js";

/**
 * Full-Text Search Utilities
 * Provides advanced search capabilities across the platform
 */

/**
 * Search suppliers with full-text search
 */
export async function searchSuppliers(
  query: string,
  filters?: {
    verification_tier?: string;
    country?: string;
    product_type?: string;
    min_rating?: number;
  },
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<{
  results: any[];
  total: number;
}> {
  try {
    let queryBuilder = supabaseAdmin
      .from("suppliers")
      .select("*, supplier_profiles(*), locations(*), products(*)", { count: "exact" });

    // Full-text search on name (using ILIKE for now, can be upgraded to pg_trgm)
    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Apply filters
    if (filters?.verification_tier) {
      queryBuilder = queryBuilder.eq("verification_tier", filters.verification_tier);
    }

    if (filters?.min_rating) {
      queryBuilder = queryBuilder.gte("rating", filters.min_rating);
    }

    // Location filter (via join)
    if (filters?.country) {
      // This would need a join or subquery - simplified for now
      // In production, use a proper join or materialized view
    }

    // Pagination
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      throw error;
    }

    return {
      results: data || [],
      total: count || 0,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        query,
        filters,
      },
      "Failed to search suppliers"
    );
    throw error;
  }
}

/**
 * Search auctions with full-text search
 */
export async function searchAuctions(
  query: string,
  filters?: {
    status?: string;
    auction_type?: string;
    min_price?: number;
    max_price?: number;
  },
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<{
  results: any[];
  total: number;
}> {
  try {
    let queryBuilder = supabaseAdmin
      .from("auctions")
      .select("*, auction_lots(*)", { count: "exact" });

    // Full-text search
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Apply filters
    if (filters?.status) {
      queryBuilder = queryBuilder.eq("status", filters.status);
    }

    if (filters?.auction_type) {
      queryBuilder = queryBuilder.eq("auction_type", filters.auction_type);
    }

    if (filters?.min_price) {
      queryBuilder = queryBuilder.gte("starting_price", filters.min_price);
    }

    if (filters?.max_price) {
      queryBuilder = queryBuilder.lte("starting_price", filters.max_price);
    }

    // Pagination
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      throw error;
    }

    return {
      results: data || [],
      total: count || 0,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        query,
        filters,
      },
      "Failed to search auctions"
    );
    throw error;
  }
}

/**
 * Search RFQs with full-text search
 */
export async function searchRFQs(
  query: string,
  filters?: {
    status?: string;
    product_type?: string;
    purity_level?: string;
  },
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<{
  results: any[];
  total: number;
}> {
  try {
    let queryBuilder = supabaseAdmin
      .from("rfqs")
      .select("*", { count: "exact" });

    // Full-text search
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Apply filters
    if (filters?.status) {
      queryBuilder = queryBuilder.eq("status", filters.status);
    }

    if (filters?.product_type) {
      queryBuilder = queryBuilder.eq("product_type", filters.product_type);
    }

    if (filters?.purity_level) {
      queryBuilder = queryBuilder.eq("purity_level", filters.purity_level);
    }

    // Pagination
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      throw error;
    }

    return {
      results: data || [],
      total: count || 0,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        query,
        filters,
      },
      "Failed to search RFQs"
    );
    throw error;
  }
}

/**
 * Universal search across multiple entities
 */
export async function universalSearch(
  query: string,
  entityTypes?: ("suppliers" | "auctions" | "rfqs")[],
  options?: {
    limit?: number;
  }
): Promise<{
  suppliers?: any[];
  auctions?: any[];
  rfqs?: any[];
}> {
  const results: any = {};
  const types = entityTypes || ["suppliers", "auctions", "rfqs"];
  const limit = options?.limit || 10;

  if (types.includes("suppliers")) {
    const supplierResults = await searchSuppliers(query, {}, { limit });
    results.suppliers = supplierResults.results;
  }

  if (types.includes("auctions")) {
    const auctionResults = await searchAuctions(query, {}, { limit });
    results.auctions = auctionResults.results;
  }

  if (types.includes("rfqs")) {
    const rfqResults = await searchRFQs(query, {}, { limit });
    results.rfqs = rfqResults.results;
  }

  return results;
}
