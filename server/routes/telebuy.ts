import { type Express, type Request, type Response } from "express";
import { supabaseAdmin } from "../db/client.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { createMeetingRoom, generateMeetingToken } from "../services/videoService.js";
import { z } from "zod";

const createTelebuySessionSchema = z.object({
  supplier_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  notes: z.string().optional(),
});

/**
 * POST /api/telebuy/sessions
 * Create a new TELEBUY session
 */
export const createTelebuySession = asyncHandler(async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const body = createTelebuySessionSchema.parse(req.body);

  // Verify supplier exists
  const { data: supplier, error: supplierError } = await supabaseAdmin
    .from("suppliers")
    .select("id, name")
    .eq("id", body.supplier_id)
    .single();

  if (supplierError || !supplier) {
    throw new NotFoundError("Supplier");
  }

  // Create Daily.co meeting room
  const meetingRoom = await createMeetingRoom({
    name: `telebuy-${supplier.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    privacy: "private",
    properties: {
      enable_screenshare: true,
      enable_recording: true,
      enable_chat: true,
      exp: Math.floor(new Date(body.scheduled_at).getTime() / 1000) + 2 * 60 * 60, // 2 hours after scheduled time
    },
  });

  // Create TELEBUY session in database
  const { data: session, error: sessionError } = await supabaseAdmin
    .from("telebuy_sessions")
    .insert({
      supplier_id: body.supplier_id,
      user_id,
      meeting_url: meetingRoom.url,
      meeting_id: meetingRoom.id,
      status: "scheduled",
      scheduled_at: body.scheduled_at,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (sessionError) {
    throw new ValidationError(`Failed to create session: ${sessionError.message}`);
  }

  // Generate meeting tokens for both participants
  const buyerToken = await generateMeetingToken(meetingRoom.name, user_id, true);
  // Supplier token would be generated when supplier joins

  res.status(201).json({
    data: {
      ...session,
      meeting_room: meetingRoom,
      buyer_token: buyerToken,
    },
  });
});

/**
 * GET /api/telebuy/sessions
 * Get user's TELEBUY sessions
 */
export const getTelebuySessions = asyncHandler(async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const status = req.query.status as string | undefined;

  let queryBuilder = supabaseAdmin
    .from("telebuy_sessions")
    .select(`
      *,
      suppliers(id, name, logo_url, verification_tier)
    `)
    .eq("user_id", user_id)
    .order("scheduled_at", { ascending: false });

  if (status) {
    queryBuilder = queryBuilder.eq("status", status);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    throw new ValidationError(`Failed to fetch sessions: ${error.message}`);
  }

  res.json({ data: data || [] });
});

/**
 * GET /api/telebuy/sessions/:id
 * Get TELEBUY session details
 */
export const getTelebuySession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = req.user!.id;

  const { data, error } = await supabaseAdmin
    .from("telebuy_sessions")
    .select(`
      *,
      suppliers(*),
      telebuy_documents(*)
    `)
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (error || !data) {
    throw new NotFoundError("TELEBUY session");
  }

  // Generate meeting token if session is active
  let meetingToken = null;
  if (data.status === "scheduled" || data.status === "in-progress") {
    const meetingId = (data as any).meeting_id;
    if (meetingId) {
      meetingToken = await generateMeetingToken(meetingId, user_id, true);
    }
  }

  res.json({
    data: {
      ...data,
      meeting_token: meetingToken,
    },
  });
});

/**
 * POST /api/telebuy/sessions/:id/start
 * Start a TELEBUY session
 */
export const startTelebuySession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = req.user!.id;

  const { data: session, error: sessionError } = await supabaseAdmin
    .from("telebuy_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (sessionError || !session) {
    throw new NotFoundError("TELEBUY session");
  }

  if (session.status !== "scheduled") {
    throw new ValidationError("Session cannot be started");
  }

  const { data: updatedSession, error: updateError } = await supabaseAdmin
    .from("telebuy_sessions")
    .update({
      status: "in-progress",
      started_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    throw new ValidationError(`Failed to start session: ${updateError.message}`);
  }

  res.json({ data: updatedSession });
});

/**
 * POST /api/telebuy/sessions/:id/end
 * End a TELEBUY session
 */
export const endTelebuySession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = req.user!.id;
  const { recording_url, transcript, notes } = req.body;

  const { data: session, error: sessionError } = await supabaseAdmin
    .from("telebuy_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (sessionError || !session) {
    throw new NotFoundError("TELEBUY session");
  }

  const { data: updatedSession, error: updateError } = await supabaseAdmin
    .from("telebuy_sessions")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
      recording_url: recording_url || null,
      transcript: transcript || null,
      notes: notes || session.notes || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    throw new ValidationError(`Failed to end session: ${updateError.message}`);
  }

  res.json({ data: updatedSession });
});

/**
 * Register TELEBUY routes
 */
export function registerTelebuyRoutes(app: Express) {
  app.post("/api/telebuy/sessions", requireAuth, createTelebuySession);
  app.get("/api/telebuy/sessions", requireAuth, getTelebuySessions);
  app.get("/api/telebuy/sessions/:id", requireAuth, getTelebuySession);
  app.post("/api/telebuy/sessions/:id/start", requireAuth, startTelebuySession);
  app.post("/api/telebuy/sessions/:id/end", requireAuth, endTelebuySession);
}



