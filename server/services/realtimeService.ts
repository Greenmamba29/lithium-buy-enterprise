import { supabaseAdmin } from "../db/client.js";

/**
 * Supabase Realtime Service
 * Handles real-time subscriptions for TELEBUY collaboration
 */

/**
 * Subscribe to TELEBUY session updates
 */
export function subscribeToSession(sessionId: string, callback: (payload: any) => void) {
  const channel = supabaseAdmin
    .channel(`telebuy-session-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "telebuy_sessions",
        filter: `id=eq.${sessionId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

/**
 * Subscribe to TELEBUY document changes
 */
export function subscribeToDocuments(sessionId: string, callback: (payload: any) => void) {
  const channel = supabaseAdmin
    .channel(`telebuy-documents-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "telebuy_documents",
        filter: `session_id=eq.${sessionId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

/**
 * Broadcast message to session participants
 */
export async function broadcastToSession(
  sessionId: string,
  message: {
    type: string;
    data: any;
    from: string;
  }
): Promise<void> {
  // Store message in a messages table or use Supabase Realtime broadcast
  // For now, we'll use a simple approach with telebuy_documents for chat
  await supabaseAdmin.from("telebuy_documents").insert({
    session_id: sessionId,
    document_type: "notes",
    content: {
      type: message.type,
      data: message.data,
      from: message.from,
      timestamp: new Date().toISOString(),
    },
    version: 1,
  });
}




