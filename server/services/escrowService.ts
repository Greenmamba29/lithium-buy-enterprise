import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { executeTransaction } from "../utils/transactions.js";

/**
 * Escrow Service
 * Handles payment escrow for auction transactions
 */

/**
 * Create escrow account for auction
 */
export async function createEscrowAccount(input: {
  auction_id?: string;
  order_id?: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  currency?: string;
}): Promise<any> {
  try {
    if (!input.auction_id && !input.order_id) {
      throw new ValidationError("Either auction_id or order_id is required");
    }

    const { data: escrow, error } = await supabaseAdmin
      .from("escrow_accounts")
      .insert({
        auction_id: input.auction_id || null,
        order_id: input.order_id || null,
        buyer_id: input.buyer_id,
        seller_id: input.seller_id,
        amount: input.amount,
        currency: input.currency || "USD",
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create escrow account: ${error.message}`);
    }

    logger.info({ escrowId: escrow.id, amount: input.amount }, "Escrow account created");

    return escrow;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        input,
      },
      "Failed to create escrow account"
    );
    throw error;
  }
}

/**
 * Fund escrow account with Stripe payment
 */
export async function fundEscrow(
  escrowId: string,
  stripePaymentIntentId: string
): Promise<any> {
  try {
    const { data: escrow, error: fetchError } = await supabaseAdmin
      .from("escrow_accounts")
      .select("*")
      .eq("id", escrowId)
      .single();

    if (fetchError || !escrow) {
      throw new NotFoundError("Escrow account");
    }

    if (escrow.status !== "pending") {
      throw new ValidationError(`Escrow is in ${escrow.status} status, cannot fund`);
    }

    // In a real implementation, verify the payment with Stripe
    // For now, we'll just update the status
    const { data: updatedEscrow, error } = await supabaseAdmin
      .from("escrow_accounts")
      .update({
        status: "funded",
        stripe_payment_intent_id: stripePaymentIntentId,
        funded_at: new Date().toISOString(),
      })
      .eq("id", escrowId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to fund escrow: ${error.message}`);
    }

    logger.info({ escrowId, amount: escrow.amount }, "Escrow account funded");

    return updatedEscrow;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        escrowId,
      },
      "Failed to fund escrow"
    );
    throw error;
  }
}

/**
 * Release escrow to seller
 */
export async function releaseEscrow(escrowId: string): Promise<any> {
  try {
    const { data: escrow, error: fetchError } = await supabaseAdmin
      .from("escrow_accounts")
      .select("*")
      .eq("id", escrowId)
      .single();

    if (fetchError || !escrow) {
      throw new NotFoundError("Escrow account");
    }

    if (escrow.status !== "funded") {
      throw new ValidationError(`Escrow is in ${escrow.status} status, cannot release`);
    }

    // In a real implementation, transfer funds to seller via Stripe
    const { data: updatedEscrow, error } = await supabaseAdmin
      .from("escrow_accounts")
      .update({
        status: "released",
        released_at: new Date().toISOString(),
      })
      .eq("id", escrowId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to release escrow: ${error.message}`);
    }

    logger.info({ escrowId, amount: escrow.amount }, "Escrow released to seller");

    return updatedEscrow;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        escrowId,
      },
      "Failed to release escrow"
    );
    throw error;
  }
}

/**
 * Refund escrow to buyer
 */
export async function refundEscrow(escrowId: string, reason?: string): Promise<any> {
  try {
    const { data: escrow, error: fetchError } = await supabaseAdmin
      .from("escrow_accounts")
      .select("*")
      .eq("id", escrowId)
      .single();

    if (fetchError || !escrow) {
      throw new NotFoundError("Escrow account");
    }

    if (!["funded", "pending"].includes(escrow.status)) {
      throw new ValidationError(`Escrow is in ${escrow.status} status, cannot refund`);
    }

    // In a real implementation, refund via Stripe
    const { data: updatedEscrow, error } = await supabaseAdmin
      .from("escrow_accounts")
      .update({
        status: "refunded",
        refunded_at: new Date().toISOString(),
      })
      .eq("id", escrowId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to refund escrow: ${error.message}`);
    }

    logger.info({ escrowId, amount: escrow.amount, reason }, "Escrow refunded to buyer");

    return updatedEscrow;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        escrowId,
      },
      "Failed to refund escrow"
    );
    throw error;
  }
}

/**
 * Get escrow account by ID
 */
export async function getEscrowById(escrowId: string): Promise<any> {
  const { data: escrow, error } = await supabaseAdmin
    .from("escrow_accounts")
    .select(`
      *,
      auction:auctions(*),
      order:orders(*)
    `)
    .eq("id", escrowId)
    .single();

  if (error || !escrow) {
    throw new NotFoundError("Escrow account");
  }

  return escrow;
}


