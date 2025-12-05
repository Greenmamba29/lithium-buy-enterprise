import { logger } from "../utils/logger.js";
import { supabaseAdmin } from "../db/client.js";
import { executeTransaction, createDeleteRollback } from "../utils/transactions.js";

/**
 * Data ingestion service
 * Handles manual data imports (Accio data is entered manually, not via API)
 */

/**
 * Validate imported data
 */
export async function validateSupplierData(supplierData: any): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  if (!supplierData.name || supplierData.name.trim().length === 0) {
    errors.push("Supplier name is required");
  }

  if (!supplierData.verification_tier) {
    errors.push("Verification tier is required");
  }

  if (supplierData.rating && (supplierData.rating < 0 || supplierData.rating > 5)) {
    errors.push("Rating must be between 0 and 5");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}



