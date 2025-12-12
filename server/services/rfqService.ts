import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { executeTransaction } from "../utils/transactions.js";

/**
 * RFQ Service
 * Handles Request for Quote creation, supplier matching, and response management
 */

export interface CreateRFQInput {
  buyer_id: string;
  title: string;
  description?: string;
  product_type: "raw" | "compound" | "processed";
  purity_level: "99" | "99.5" | "99.9";
  quantity: number;
  unit?: string;
  target_price?: number;
  currency?: string;
  delivery_location_country: string;
  delivery_location_city?: string;
  required_certifications?: string[];
  deadline: string;
}

/**
 * Create a new RFQ
 */
export async function createRFQ(input: CreateRFQInput): Promise<any> {
  try {
    // Validate deadline
    const deadline = new Date(input.deadline);
    if (deadline <= new Date()) {
      throw new ValidationError("Deadline must be in the future");
    }

    const { data: rfq, error } = await supabaseAdmin
      .from("rfqs")
      .insert({
        buyer_id: input.buyer_id,
        title: input.title,
        description: input.description || null,
        status: "draft",
        product_type: input.product_type,
        purity_level: input.purity_level,
        quantity: input.quantity,
        unit: input.unit || "ton",
        target_price: input.target_price || null,
        currency: input.currency || "USD",
        delivery_location_country: input.delivery_location_country,
        delivery_location_city: input.delivery_location_city || null,
        required_certifications: input.required_certifications || [],
        deadline: input.deadline,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create RFQ: ${error.message}`);
    }

    logger.info({ rfqId: rfq.id, buyerId: input.buyer_id }, "RFQ created successfully");

    return rfq;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        input,
      },
      "Failed to create RFQ"
    );
    throw error;
  }
}

/**
 * Publish an RFQ (makes it visible to suppliers)
 */
export async function publishRFQ(rfqId: string, buyerId: string): Promise<any> {
  try {
    // Verify ownership
    const { data: rfq, error: fetchError } = await supabaseAdmin
      .from("rfqs")
      .select("*")
      .eq("id", rfqId)
      .single();

    if (fetchError || !rfq) {
      throw new NotFoundError("RFQ");
    }

    if (rfq.buyer_id !== buyerId) {
      throw new ValidationError("Only the RFQ creator can publish it");
    }

    if (rfq.status !== "draft") {
      throw new ValidationError("Only draft RFQs can be published");
    }

    const { data: publishedRFQ, error } = await supabaseAdmin
      .from("rfqs")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", rfqId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to publish RFQ: ${error.message}`);
    }

    logger.info({ rfqId, buyerId }, "RFQ published successfully");

    return publishedRFQ;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        rfqId,
        buyerId,
      },
      "Failed to publish RFQ"
    );
    throw error;
  }
}

/**
 * Get RFQ by ID with responses
 */
export async function getRFQById(rfqId: string, userId?: string): Promise<any> {
  const { data: rfq, error } = await supabaseAdmin
    .from("rfqs")
    .select(`
      *,
      rfq_responses(
        *,
        supplier:suppliers(id, name, logo_url, verification_tier, rating),
        user:auth.users(id, email)
      ),
      buyer:auth.users(id, email)
    `)
    .eq("id", rfqId)
    .single();

  if (error || !rfq) {
    throw new NotFoundError("RFQ");
  }

  // Check access permissions - cast to any to bypass Supabase parser type limitations
  const rfqData = rfq as any;
  if (rfqData.status === "draft" && rfqData.buyer_id !== userId) {
    throw new ValidationError("Access denied");
  }

  return rfq;
}

/**
 * List RFQs with filters
 */
export async function listRFQs(filters?: {
  buyer_id?: string;
  status?: string;
  product_type?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: any[]; total: number }> {
  const limit = filters?.limit || 20;
  const offset = filters?.offset || 0;

  let query = supabaseAdmin
    .from("rfqs")
    .select(`
      *,
      buyer:auth.users(id, email),
      rfq_responses(count)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.buyer_id) {
    query = query.eq("buyer_id", filters.buyer_id);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  } else {
    // Default: show published RFQs to suppliers, all to buyers
    if (!filters?.buyer_id) {
      query = query.eq("status", "published");
    }
  }

  if (filters?.product_type) {
    query = query.eq("product_type", filters.product_type);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch RFQs: ${error.message}`);
  }

  return {
    data: data || [],
    total: count || 0,
  };
}

/**
 * Submit RFQ response (supplier)
 */
export async function submitRFQResponse(
  rfqId: string,
  supplierId: string,
  userId: string,
  input: {
    quote_price: number;
    currency?: string;
    delivery_time_days?: number;
    payment_terms?: string;
    notes?: string;
  }
): Promise<any> {
  try {
    // Verify RFQ is published
    const { data: rfq, error: rfqError } = await supabaseAdmin
      .from("rfqs")
      .select("*")
      .eq("id", rfqId)
      .single();

    if (rfqError || !rfq) {
      throw new NotFoundError("RFQ");
    }

    if (rfq.status !== "published") {
      throw new ValidationError("RFQ is not published");
    }

    if (new Date(rfq.deadline) < new Date()) {
      throw new ValidationError("RFQ deadline has passed");
    }

    // Check if supplier already responded
    const { data: existing } = await supabaseAdmin
      .from("rfq_responses")
      .select("id")
      .eq("rfq_id", rfqId)
      .eq("supplier_id", supplierId)
      .single();

    if (existing) {
      throw new ValidationError("You have already submitted a response to this RFQ");
    }

    // Calculate score (simplified - can be enhanced)
    const score = calculateRFQScore(rfq, input);

    const { data: response, error } = await supabaseAdmin
      .from("rfq_responses")
      .insert({
        rfq_id: rfqId,
        supplier_id: supplierId,
        user_id: userId,
        quote_price: input.quote_price,
        currency: input.currency || "USD",
        delivery_time_days: input.delivery_time_days || null,
        payment_terms: input.payment_terms || null,
        notes: input.notes || null,
        status: "submitted",
        score: score,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit response: ${error.message}`);
    }

    logger.info(
      { rfqId, supplierId, responseId: response.id },
      "RFQ response submitted successfully"
    );

    return response;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        rfqId,
        supplierId,
      },
      "Failed to submit RFQ response"
    );
    throw error;
  }
}

/**
 * Calculate RFQ response score (0-100)
 */
function calculateRFQScore(rfq: any, response: any): number {
  let score = 50; // Base score

  // Price comparison (if target price exists)
  if (rfq.target_price) {
    const priceDiff = Math.abs(response.quote_price - rfq.target_price);
    const pricePercent = (priceDiff / rfq.target_price) * 100;
    if (pricePercent <= 5) score += 20;
    else if (pricePercent <= 10) score += 10;
    else if (pricePercent <= 20) score += 5;
  }

  // Delivery time (faster is better)
  if (response.delivery_time_days) {
    if (response.delivery_time_days <= 7) score += 15;
    else if (response.delivery_time_days <= 14) score += 10;
    else if (response.delivery_time_days <= 30) score += 5;
  }

  // Payment terms (better terms = higher score)
  if (response.payment_terms) {
    const terms = response.payment_terms.toLowerCase();
    if (terms.includes("net 30") || terms.includes("net 60")) score += 10;
    if (terms.includes("letter of credit")) score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Get RFQ responses with comparison
 */
export async function getRFQResponses(rfqId: string, buyerId: string): Promise<any[]> {
  // Verify ownership
  const { data: rfq, error: rfqError } = await supabaseAdmin
    .from("rfqs")
    .select("buyer_id")
    .eq("id", rfqId)
    .single();

  if (rfqError || !rfq) {
    throw new NotFoundError("RFQ");
  }

  if (rfq.buyer_id !== buyerId) {
    throw new ValidationError("Only the RFQ creator can view responses");
  }

  const { data: responses, error } = await supabaseAdmin
    .from("rfq_responses")
    .select(`
      *,
      supplier:suppliers(id, name, logo_url, verification_tier, rating, review_count),
      user:auth.users(id, email)
    `)
    .eq("rfq_id", rfqId)
    .order("score", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch responses: ${error.message}`);
  }

  return responses || [];
}

/**
 * Award RFQ to a supplier
 */
export async function awardRFQ(
  rfqId: string,
  responseId: string,
  buyerId: string
): Promise<any> {
  try {
    // Verify ownership and get RFQ
    const { data: rfq, error: rfqError } = await supabaseAdmin
      .from("rfqs")
      .select("*")
      .eq("id", rfqId)
      .single();

    if (rfqError || !rfq) {
      throw new NotFoundError("RFQ");
    }

    if (rfq.buyer_id !== buyerId) {
      throw new ValidationError("Only the RFQ creator can award it");
    }

    if (rfq.status === "awarded") {
      throw new ValidationError("RFQ has already been awarded");
    }

    // Get response
    const { data: response, error: responseError } = await supabaseAdmin
      .from("rfq_responses")
      .select("*")
      .eq("id", responseId)
      .eq("rfq_id", rfqId)
      .single();

    if (responseError || !response) {
      throw new NotFoundError("RFQ response");
    }

    // Use transaction to update RFQ and response status
    const transactionResult = await executeTransaction([
      {
        description: `Update RFQ status to awarded`,
        execute: async () => {
          const { data: updatedRFQ, error } = await supabaseAdmin
            .from("rfqs")
            .update({
              status: "awarded",
              awarded_to: response.supplier_id,
              closed_at: new Date().toISOString(),
            })
            .eq("id", rfqId)
            .select()
            .single();

          if (error) {
            throw new Error(`Failed to award RFQ: ${error.message}`);
          }

          return updatedRFQ;
        },
      },
      {
        description: `Update response status to accepted`,
        execute: async () => {
          const { data: updatedResponse, error } = await supabaseAdmin
            .from("rfq_responses")
            .update({ status: "accepted" })
            .eq("id", responseId)
            .select()
            .single();

          if (error) {
            throw new Error(`Failed to update response: ${error.message}`);
          }

          return updatedResponse;
        },
      },
      {
        description: `Reject other responses`,
        execute: async () => {
          const { error } = await supabaseAdmin
            .from("rfq_responses")
            .update({ status: "rejected" })
            .eq("rfq_id", rfqId)
            .neq("id", responseId);

          if (error) {
            throw new Error(`Failed to reject other responses: ${error.message}`);
          }

          return { rejected: true };
        },
      },
    ]);

    if (!transactionResult.success) {
      throw transactionResult.error || new ValidationError("Failed to award RFQ");
    }

    logger.info(
      { rfqId, responseId, supplierId: response.supplier_id },
      "RFQ awarded successfully"
    );

    return {
      rfq: transactionResult.data[0],
      response: transactionResult.data[1],
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        rfqId,
        responseId,
        buyerId,
      },
      "Failed to award RFQ"
    );
    throw error;
  }
}

/**
 * Get supplier matching suggestions for an RFQ
 */
export async function getMatchingSuppliers(rfqId: string): Promise<any[]> {
  const { data: rfq, error } = await supabaseAdmin
    .from("rfqs")
    .select("*")
    .eq("id", rfqId)
    .single();

  if (error || !rfq) {
    throw new NotFoundError("RFQ");
  }

  // Find suppliers that match RFQ criteria
  let query = supabaseAdmin
    .from("suppliers")
    .select(`
      *,
      products!inner(
        product_type,
        purity_level,
        price_per_unit,
        availability
      ),
      locations(country, city)
    `)
    .eq("products.product_type", rfq.product_type)
    .eq("products.purity_level", rfq.purity_level)
    .eq("products.availability", "in-stock")
    .limit(20);

  // Filter by location if specified
  if (rfq.delivery_location_country) {
    query = query.eq("locations.country", rfq.delivery_location_country);
  }

  const { data: suppliers, error: supplierError } = await query;

  if (supplierError) {
    throw new Error(`Failed to find matching suppliers: ${supplierError.message}`);
  }

  return suppliers || [];
}
