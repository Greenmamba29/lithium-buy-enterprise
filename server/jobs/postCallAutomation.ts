import { supabaseAdmin } from "../db/client.js";
import { transcribeRecording, extractKeyPoints } from "../services/transcriptionService.js";
import { sendEmail } from "../services/emailService.js";
import { updateContractDocument } from "../services/contractService.js";
import { logger } from "../utils/logger.js";

/**
 * Post-call automation job
 * Runs after TELEBUY session ends to:
 * 1. Transcribe recording
 * 2. Extract key points
 * 3. Update contract with agreed terms
 * 4. Send follow-up emails
 * 5. Create quote/order if agreed
 */

export async function runPostCallAutomation(sessionId: string): Promise<void> {
  logger.info({ source: "postCall", sessionId }, "Running post-call automation");

  try {
    // Get session details
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("telebuy_sessions")
      .select(`
        *,
        suppliers(name, supplier_profiles(contact_email)),
        users(email)
      `)
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error("Session not found");
    }

    // 1. Transcribe recording if available
    if (session.recording_url) {
      logger.info({ source: "postCall", sessionId }, "Transcribing recording");
      const transcript = await transcribeRecording(session.recording_url);

      // Update session with transcript
      await supabaseAdmin
        .from("telebuy_sessions")
        .update({ transcript })
        .eq("id", sessionId);

      // 2. Extract key points
      const keyPoints = await extractKeyPoints(transcript);

      // 3. Update contract if key points include pricing/terms
      const { data: documents } = await supabaseAdmin
        .from("telebuy_documents")
        .select("id")
        .eq("session_id", sessionId)
        .eq("document_type", "contract")
        .limit(1);

      if (documents && documents.length > 0 && keyPoints.agreedPrice) {
        await updateContractDocument(documents[0].id, {
          pricePerUnit: keyPoints.agreedPrice,
          quantity: keyPoints.quantity,
          paymentTerms: keyPoints.paymentTerms,
        });
      }

      // 4. Send follow-up emails
      const supplierEmail = (session as any).suppliers?.supplier_profiles?.[0]?.contact_email;
      const buyerEmail = (session as any).users?.email;

      if (supplierEmail) {
        await sendEmail({
          to: supplierEmail,
          subject: `TELEBUY Session Summary - ${(session as any).suppliers?.name}`,
          html: `
            <h2>TELEBUY Session Completed</h2>
            <p>Session summary:</p>
            <ul>
              <li><strong>Duration:</strong> ${session.started_at && session.ended_at 
                ? `${Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000)} minutes`
                : 'N/A'}</li>
              ${keyPoints.agreedPrice ? `<li><strong>Agreed Price:</strong> $${keyPoints.agreedPrice}</li>` : ''}
            </ul>
            ${session.transcript ? `<p><strong>Transcript:</strong> Available in your dashboard</p>` : ''}
          `,
        });
      }

      if (buyerEmail) {
        await sendEmail({
          to: buyerEmail,
          subject: "TELEBUY Session Summary",
          html: `
            <h2>Your TELEBUY Session</h2>
            <p>Thank you for using TELEBUY. Your session summary is available in your dashboard.</p>
          `,
        });
      }
    }

    logger.info({ source: "postCall", sessionId }, "Post-call automation completed");
  } catch (error) {
    logger.error(
      { source: "postCall", sessionId, error: error instanceof Error ? error.message : "Unknown error" },
      "Post-call automation failed"
    );
    throw error;
  }
}



