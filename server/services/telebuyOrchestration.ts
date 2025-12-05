import { createMeetingRoom } from "./videoService.js";
import { createContractDocument } from "./contractService.js";
import { sendEmail } from "./emailService.js";
import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";

/**
 * TELEBUY Orchestration Service
 * Handles the complete frictionless TELEBUY flow
 */

interface TelebuyOrchestrationData {
  supplier_id: string;
  user_id: string;
  product_id?: string;
  scheduled_at: string;
}

/**
 * Orchestrate complete TELEBUY flow
 * 1. Create meeting room
 * 2. Create session record
 * 3. Generate contract template
 * 4. Send calendar invites
 * 5. Notify participants
 */
export async function orchestrateTelebuyFlow(
  data: TelebuyOrchestrationData
): Promise<{
  sessionId: string;
  meetingUrl: string;
  contractId: string;
}> {
  logger.info(
    { source: "telebuy", supplierId: data.supplier_id, userId: data.user_id },
    "Orchestrating TELEBUY flow"
  );

  // 1. Get supplier and user details
  const { data: supplier } = await supabaseAdmin
    .from("suppliers")
    .select("name, supplier_profiles(contact_email)")
    .eq("id", data.supplier_id)
    .single();

  const { data: user } = await supabaseAdmin.auth.admin.getUserById(data.user_id);

  if (!supplier || !user) {
    throw new Error("Supplier or user not found");
  }

  // 2. Create meeting room
  const meetingRoom = await createMeetingRoom({
    name: `telebuy-${supplier.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    privacy: "private",
    properties: {
      enable_screenshare: true,
      enable_recording: true,
      enable_chat: true,
      exp: Math.floor(new Date(data.scheduled_at).getTime() / 1000) + 2 * 60 * 60,
    },
  });

  // 3. Create TELEBUY session
  const { data: session, error: sessionError } = await supabaseAdmin
    .from("telebuy_sessions")
    .insert({
      supplier_id: data.supplier_id,
      user_id: data.user_id,
      meeting_url: meetingRoom.url,
      meeting_id: meetingRoom.id,
      status: "scheduled",
      scheduled_at: data.scheduled_at,
    })
    .select()
    .single();

  if (sessionError || !session) {
    throw new Error(`Failed to create session: ${sessionError?.message}`);
  }

  // 4. Generate contract template if product is specified
  let contractId: string | null = null;
  if (data.product_id) {
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", data.product_id)
      .single();

    if (product) {
      contractId = await createContractDocument(session.id, {
        supplierName: supplier.name,
        buyerName: user.user?.email || "Buyer",
        productName: product.name,
        quantity: product.min_order_quantity || 1,
        pricePerUnit: product.price_per_unit,
        totalAmount: product.price_per_unit * (product.min_order_quantity || 1),
        currency: product.currency,
      });
    }
  }

  // 5. Send calendar invites (placeholder - would integrate with calendar API)
  logger.info(
    { source: "telebuy", sessionId: session.id },
    "Calendar invites would be sent here"
  );

  // 6. Send notification emails
  const supplierEmail = (supplier as any).supplier_profiles?.[0]?.contact_email;
  if (supplierEmail) {
    try {
      await sendEmail({
        to: supplierEmail,
        subject: `New TELEBUY Session Scheduled - ${supplier.name}`,
        html: `
          <h2>New TELEBUY Session</h2>
          <p>A new video call has been scheduled:</p>
          <ul>
            <li><strong>Date:</strong> ${new Date(data.scheduled_at).toLocaleString()}</li>
            <li><strong>Meeting URL:</strong> <a href="${meetingRoom.url}">${meetingRoom.url}</a></li>
          </ul>
        `,
      });
    } catch (error) {
      logger.error(
        { source: "telebuy", error: error instanceof Error ? error.message : "Unknown" },
        "Failed to send email to supplier"
      );
    }
  }

  return {
    sessionId: session.id,
    meetingUrl: meetingRoom.url,
    contractId: contractId || "",
  };
}




