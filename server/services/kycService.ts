import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

/**
 * KYC Service
 * Handles user KYC verification for platform access control
 * PRD: KYC flow <10 min, verification turnaround <24h
 */

export interface KYCApplicationInput {
  user_id: string;
  company_name: string;
  company_registration_number?: string;
  company_address: {
    street?: string;
    city?: string;
    state?: string;
    country: string;
    postal_code?: string;
  };
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  verification_documents: Array<{
    type: string;
    url: string;
    name: string;
  }>;
}

export interface KYCReviewInput {
  application_id: string;
  status: "approved" | "rejected";
  review_notes?: string;
  reviewed_by: string;
}

/**
 * Submit KYC application
 */
export async function submitKYCApplication(input: KYCApplicationInput): Promise<any> {
  try {
    // Validate input
    if (!input.user_id || !input.company_name || !input.contact_email) {
      throw new ValidationError("Missing required fields: user_id, company_name, contact_email");
    }

    // Check if user already has a KYC application
    const { data: existing } = await supabaseAdmin
      .from("kyc_verifications")
      .select("id, kyc_status")
      .eq("user_id", input.user_id)
      .single();

    if (existing) {
      if (existing.kyc_status === "approved") {
        throw new ValidationError("User already has approved KYC verification");
      }
      if (existing.kyc_status === "pending") {
        throw new ValidationError("User already has a pending KYC application");
      }
      // If rejected, allow resubmission
    }

    // Create or update KYC application
    const kycData: any = {
      user_id: input.user_id,
      company_name: input.company_name,
      company_registration_number: input.company_registration_number || null,
      company_address: input.company_address,
      contact_person: input.contact_person,
      contact_email: input.contact_email,
      contact_phone: input.contact_phone,
      verification_documents: input.verification_documents,
      kyc_status: "pending",
      submitted_at: new Date().toISOString(),
    };

    let result;
    if (existing) {
      // Update existing application
      const { data, error } = await supabaseAdmin
        .from("kyc_verifications")
        .update(kycData)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update KYC application: ${error.message}`);
      }
      result = data;
    } else {
      // Create new application
      const { data, error } = await supabaseAdmin
        .from("kyc_verifications")
        .insert(kycData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create KYC application: ${error.message}`);
      }
      result = data;
    }

    logger.info(
      {
        userId: input.user_id,
        kycId: result.id,
        companyName: input.company_name,
      },
      "KYC application submitted"
    );

    return result;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        input,
      },
      "Failed to submit KYC application"
    );
    throw error;
  }
}

/**
 * Review KYC application (admin only)
 */
export async function reviewKYCApplication(input: KYCReviewInput): Promise<any> {
  try {
    // Get application
    const { data: application, error: fetchError } = await supabaseAdmin
      .from("kyc_verifications")
      .select("*")
      .eq("id", input.application_id)
      .single();

    if (fetchError || !application) {
      throw new NotFoundError("KYC application");
    }

    if (application.kyc_status !== "pending") {
      throw new ValidationError(
        `Cannot review application with status: ${application.kyc_status}`
      );
    }

    // Update application
    const { data: updated, error } = await supabaseAdmin
      .from("kyc_verifications")
      .update({
        kyc_status: input.status,
        reviewed_by: input.reviewed_by,
        reviewed_at: new Date().toISOString(),
        review_notes: input.review_notes || null,
      })
      .eq("id", input.application_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to review KYC application: ${error.message}`);
    }

    logger.info(
      {
        kycId: input.application_id,
        userId: application.user_id,
        status: input.status,
        reviewedBy: input.reviewed_by,
      },
      "KYC application reviewed"
    );

    return updated;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        input,
      },
      "Failed to review KYC application"
    );
    throw error;
  }
}

/**
 * Get KYC status for a user
 */
export async function getKYCStatus(userId: string): Promise<any> {
  try {
    const { data, error } = await supabaseAdmin
      .from("kyc_verifications")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      throw new Error(`Failed to fetch KYC status: ${error.message}`);
    }

    if (!data) {
      return {
        user_id: userId,
        kyc_status: "not_submitted",
        submitted_at: null,
        reviewed_at: null,
      };
    }

    return data;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        userId,
      },
      "Failed to get KYC status"
    );
    throw error;
  }
}

/**
 * Verify user access (check KYC before allowing auction access)
 */
export async function verifyUserAccess(
  userId: string,
  requiredRole?: "supplier" | "buyer"
): Promise<boolean> {
  try {
    const kycStatus = await getKYCStatus(userId);

    // KYC must be approved
    if (kycStatus.kyc_status !== "approved") {
      logger.warn(
        {
          userId,
          kycStatus: kycStatus.kyc_status,
          requiredRole,
        },
        "User access denied: KYC not approved"
      );
      return false;
    }

    return true;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        userId,
        requiredRole,
      },
      "Failed to verify user access"
    );
    return false;
  }
}

/**
 * Get all pending KYC applications (admin)
 */
export async function getPendingKYCApplications(limit = 50, offset = 0): Promise<{
  data: any[];
  total: number;
}> {
  try {
    const { data, error, count } = await supabaseAdmin
      .from("kyc_verifications")
      .select("*", { count: "exact" })
      .eq("kyc_status", "pending")
      .order("submitted_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch pending KYC applications: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get pending KYC applications"
    );
    throw error;
  }
}

