import { type Express, type Request, type Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

/**
 * Register admin routes
 */
export function registerAdminRoutes(app: Express) {
  // Admin routes will be added here as needed
}



