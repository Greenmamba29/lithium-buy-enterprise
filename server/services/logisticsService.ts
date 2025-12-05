import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

/**
 * Logistics Service
 * Handles shipping and logistics for auction orders
 */

export interface LogisticsOption {
  provider_name: string;
  service_type: "standard" | "express" | "overnight" | "custom";
  estimated_days: number;
  cost: number;
  currency?: string;
  origin_country: string;
  origin_city?: string;
  destination_country: string;
  destination_city?: string;
}

/**
 * Create logistics option for auction or order
 */
export async function createLogisticsOption(input: {
  auction_id?: string;
  order_id?: string;
  option: LogisticsOption;
}): Promise<any> {
  try {
    if (!input.auction_id && !input.order_id) {
      throw new ValidationError("Either auction_id or order_id is required");
    }

    const { data: logistics, error } = await supabaseAdmin
      .from("logistics_options")
      .insert({
        auction_id: input.auction_id || null,
        order_id: input.order_id || null,
        provider_name: input.option.provider_name,
        service_type: input.option.service_type,
        estimated_days: input.option.estimated_days,
        cost: input.option.cost,
        currency: input.option.currency || "USD",
        origin_country: input.option.origin_country,
        origin_city: input.option.origin_city || null,
        destination_country: input.option.destination_country,
        destination_city: input.option.destination_city || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create logistics option: ${error.message}`);
    }

    logger.info(
      { logisticsId: logistics.id, provider: input.option.provider_name },
      "Logistics option created"
    );

    return logistics;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        input,
      },
      "Failed to create logistics option"
    );
    throw error;
  }
}

/**
 * Book logistics (confirm shipping)
 */
export async function bookLogistics(
  logisticsId: string,
  trackingNumber?: string
): Promise<any> {
  try {
    const { data: logistics, error: fetchError } = await supabaseAdmin
      .from("logistics_options")
      .select("*")
      .eq("id", logisticsId)
      .single();

    if (fetchError || !logistics) {
      throw new NotFoundError("Logistics option");
    }

    if (logistics.status !== "pending") {
      throw new ValidationError(`Logistics is in ${logistics.status} status, cannot book`);
    }

    const { data: updatedLogistics, error } = await supabaseAdmin
      .from("logistics_options")
      .update({
        status: "booked",
        tracking_number: trackingNumber || null,
      })
      .eq("id", logisticsId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to book logistics: ${error.message}`);
    }

    logger.info({ logisticsId, trackingNumber }, "Logistics booked");

    return updatedLogistics;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        logisticsId,
      },
      "Failed to book logistics"
    );
    throw error;
  }
}

/**
 * Update logistics status
 */
export async function updateLogisticsStatus(
  logisticsId: string,
  status: "pending" | "booked" | "in_transit" | "delivered" | "cancelled"
): Promise<any> {
  const { data, error } = await supabaseAdmin
    .from("logistics_options")
    .update({ status })
    .eq("id", logisticsId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update logistics status: ${error.message}`);
  }

  logger.info({ logisticsId, status }, "Logistics status updated");

  return data;
}

/**
 * Get logistics options for auction or order
 */
export async function getLogisticsOptions(filters: {
  auction_id?: string;
  order_id?: string;
}): Promise<any[]> {
  let query = supabaseAdmin.from("logistics_options").select("*");

  if (filters.auction_id) {
    query = query.eq("auction_id", filters.auction_id);
  }

  if (filters.order_id) {
    query = query.eq("order_id", filters.order_id);
  }

  const { data, error } = await query.order("cost", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch logistics options: ${error.message}`);
  }

  return data || [];
}

/**
 * Get available logistics providers
 * In a real implementation, this would integrate with logistics APIs
 */
export async function getAvailableProviders(
  origin: { country: string; city?: string },
  destination: { country: string; city?: string }
): Promise<Array<{ name: string; services: string[] }>> {
  // Mock data - in production, this would query logistics provider APIs
  return [
    {
      name: "DHL Global Forwarding",
      services: ["standard", "express"],
    },
    {
      name: "FedEx Trade Networks",
      services: ["standard", "express", "overnight"],
    },
    {
      name: "UPS Supply Chain Solutions",
      services: ["standard", "express"],
    },
    {
      name: "Maersk Logistics",
      services: ["standard", "custom"],
    },
  ];
}


