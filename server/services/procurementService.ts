import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

/**
 * Procurement Service
 * Handles procurement analytics, supplier performance, and contract management
 */

/**
 * Get procurement analytics for a supplier
 */
export async function getSupplierProcurementAnalytics(
  supplierId: string,
  periodStart?: string,
  periodEnd?: string
): Promise<any> {
  const start = periodStart || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const end = periodEnd || new Date().toISOString().split("T")[0];

  const { data: analytics, error } = await supabaseAdmin
    .from("procurement_analytics")
    .select("*")
    .eq("supplier_id", supplierId)
    .gte("period_start", start)
    .lte("period_end", end)
    .order("period_start", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch analytics: ${error.message}`);
  }

  return analytics || [];
}

/**
 * Calculate and update procurement analytics for a supplier
 */
export async function updateProcurementAnalytics(supplierId: string): Promise<any> {
  try {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30); // Last 30 days
    const periodEnd = new Date();

    // Get RFQ statistics
    const { data: rfqResponses, error: rfqError } = await supabaseAdmin
      .from("rfq_responses")
      .select("*")
      .eq("supplier_id", supplierId)
      .gte("created_at", periodStart.toISOString())
      .lte("created_at", periodEnd.toISOString());

    if (rfqError) {
      throw new Error(`Failed to fetch RFQ data: ${rfqError.message}`);
    }

    // Calculate metrics
    const totalRFQsReceived = rfqResponses?.length || 0;
    const totalRFQsResponded = rfqResponses?.filter((r) => r.status !== "rejected").length || 0;
    const responseRate = totalRFQsReceived > 0 ? (totalRFQsResponded / totalRFQsReceived) * 100 : 0;

    // Calculate average response time (simplified)
    const averageResponseTime = totalRFQsResponded > 0 ? 24 : null; // Placeholder

    // Get contract statistics
    const { data: contracts, error: contractError } = await supabaseAdmin
      .from("contracts")
      .select("total_amount")
      .eq("supplier_id", supplierId)
      .eq("status", "active")
      .gte("created_at", periodStart.toISOString());

    if (contractError) {
      logger.warn({ error: contractError.message }, "Failed to fetch contract data");
    }

    const totalContracts = contracts?.length || 0;
    const totalContractValue = contracts?.reduce((sum, c) => sum + (parseFloat(c.total_amount) || 0), 0) || 0;

    // Upsert analytics
    const { data: analytics, error: upsertError } = await supabaseAdmin
      .from("procurement_analytics")
      .upsert(
        {
          supplier_id: supplierId,
          period_start: periodStart.toISOString().split("T")[0],
          period_end: periodEnd.toISOString().split("T")[0],
          total_rfqs_received: totalRFQsReceived,
          total_rfqs_responded: totalRFQsResponded,
          response_rate: responseRate,
          average_response_time_hours: averageResponseTime,
          total_contracts_awarded: totalContracts,
          total_contract_value: totalContractValue,
          on_time_delivery_rate: 95, // Placeholder - would come from order tracking
          quality_score: 90, // Placeholder - would come from reviews
          reliability_score: 85, // Placeholder - calculated from various factors
        },
        {
          onConflict: "supplier_id,period_start,period_end",
        }
      )
      .select()
      .single();

    if (upsertError) {
      throw new Error(`Failed to update analytics: ${upsertError.message}`);
    }

    return analytics;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        supplierId,
      },
      "Failed to update procurement analytics"
    );
    throw error;
  }
}

/**
 * Create a contract from an awarded RFQ
 */
export async function createContractFromRFQ(
  rfqId: string,
  responseId: string,
  buyerId: string
): Promise<any> {
  try {
    // Get RFQ and response
    const { data: rfq, error: rfqError } = await supabaseAdmin
      .from("rfqs")
      .select("*")
      .eq("id", rfqId)
      .eq("buyer_id", buyerId)
      .single();

    if (rfqError || !rfq) {
      throw new NotFoundError("RFQ");
    }

    if (rfq.status !== "awarded") {
      throw new ValidationError("RFQ must be awarded before creating a contract");
    }

    const { data: response, error: responseError } = await supabaseAdmin
      .from("rfq_responses")
      .select("*")
      .eq("id", responseId)
      .eq("rfq_id", rfqId)
      .eq("status", "accepted")
      .single();

    if (responseError || !response) {
      throw new NotFoundError("RFQ response");
    }

    // Create contract
    const contractContent = {
      product_type: rfq.product_type,
      purity_level: rfq.purity_level,
      quantity: rfq.quantity,
      unit: rfq.unit,
      price: response.quote_price,
      currency: response.currency,
      delivery_location: {
        country: rfq.delivery_location_country,
        city: rfq.delivery_location_city,
      },
      delivery_time_days: response.delivery_time_days,
      payment_terms: response.payment_terms,
      notes: response.notes,
    };

    const { data: contract, error } = await supabaseAdmin
      .from("contracts")
      .insert({
        rfq_id: rfqId,
        buyer_id: buyerId,
        supplier_id: response.supplier_id,
        contract_type: "purchase",
        status: "pending_signature",
        content: contractContent,
        version: 1,
        effective_date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create contract: ${error.message}`);
    }

    logger.info(
      { contractId: contract.id, rfqId, buyerId, supplierId: response.supplier_id },
      "Contract created from RFQ"
    );

    return contract;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        rfqId,
        responseId,
        buyerId,
      },
      "Failed to create contract from RFQ"
    );
    throw error;
  }
}

/**
 * Get contract by ID
 */
export async function getContractById(contractId: string, userId: string): Promise<any> {
  const { data: contract, error } = await supabaseAdmin
    .from("contracts")
    .select(`
      *,
      buyer:auth.users(id, email),
      supplier:suppliers(id, name, logo_url)
    `)
    .eq("id", contractId)
    .single();

  if (error || !contract) {
    throw new NotFoundError("Contract");
  }

  // Verify access
  if (contract.buyer_id !== userId && contract.supplier_id !== userId) {
    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (profile?.role !== "admin") {
      throw new ValidationError("Access denied");
    }
  }

  return contract;
}

/**
 * List contracts for a user
 */
export async function listContracts(filters?: {
  buyer_id?: string;
  supplier_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: any[]; total: number }> {
  const limit = filters?.limit || 20;
  const offset = filters?.offset || 0;

  let query = supabaseAdmin
    .from("contracts")
    .select(`
      *,
      buyer:auth.users(id, email),
      supplier:suppliers(id, name, logo_url)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.buyer_id) {
    query = query.eq("buyer_id", filters.buyer_id);
  }

  if (filters?.supplier_id) {
    query = query.eq("supplier_id", filters.supplier_id);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch contracts: ${error.message}`);
  }

  return {
    data: data || [],
    total: count || 0,
  };
}
