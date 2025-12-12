import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";

/**
 * Audit Log Service
 * PRD: Log every action with timestamp, actor, IP, details
 * Retention: 5-7 years
 * Searchable & exportable
 */

export interface AuditLogEntry {
  action: string;
  actor: string; // user_id or system
  ip_address?: string;
  details: any; // JSONB
  timestamp: Date;
}

/**
 * Log an action to audit trail
 */
export async function logAction(
  action: string,
  actor: string,
  ip: string | undefined,
  details: any
): Promise<void> {
  try {
    // Note: This assumes an audit_logs table exists
    // If not, we'll need to create it in a migration
    const { error } = await supabaseAdmin.from("audit_logs").insert({
      action,
      actor,
      ip_address: ip || null,
      details,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      // If table doesn't exist, just log to console for now
      logger.warn(
        {
          error: error.message,
          action,
          actor,
        },
        "Failed to write audit log (table may not exist)"
      );
      
      // Fallback: log to application logs
      logger.info(
        {
          action,
          actor,
          ip,
          details,
          timestamp: new Date().toISOString(),
        },
        "Audit action (fallback logging)"
      );
    }
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        action,
        actor,
      },
      "Failed to log audit action"
    );
  }
}

/**
 * Search audit logs
 */
export async function searchAuditLogs(filters: {
  action?: string;
  actor?: string;
  start_date?: string;
  end_date?: string;
  ip_address?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: AuditLogEntry[]; total: number }> {
  try {
    let query = supabaseAdmin.from("audit_logs").select("*", { count: "exact" });

    if (filters.action) {
      query = query.eq("action", filters.action);
    }

    if (filters.actor) {
      query = query.eq("actor", filters.actor);
    }

    if (filters.ip_address) {
      query = query.eq("ip_address", filters.ip_address);
    }

    if (filters.start_date) {
      query = query.gte("timestamp", filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte("timestamp", filters.end_date);
    }

    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    query = query.order("timestamp", { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      // Table might not exist
      logger.warn({ error: error.message }, "Failed to search audit logs");
      return { data: [], total: 0 };
    }

    return {
      data: (data || []) as AuditLogEntry[],
      total: count || 0,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        filters,
      },
      "Failed to search audit logs"
    );
    return { data: [], total: 0 };
  }
}

/**
 * Export audit logs for compliance
 */
export async function exportAuditLogs(dateRange: {
  start_date: string;
  end_date: string;
}): Promise<AuditLogEntry[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .select("*")
      .gte("timestamp", dateRange.start_date)
      .lte("timestamp", dateRange.end_date)
      .order("timestamp", { ascending: true });

    if (error) {
      logger.warn({ error: error.message }, "Failed to export audit logs");
      return [];
    }

    return (data || []) as AuditLogEntry[];
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        dateRange,
      },
      "Failed to export audit logs"
    );
    return [];
  }
}

