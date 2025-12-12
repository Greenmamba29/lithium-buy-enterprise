import { type Express, type Request, type Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { AuthorizationError } from "../utils/errors.js";
import {
  submitKYCApplication,
  reviewKYCApplication,
  getKYCStatus,
  verifyUserAccess,
  getPendingKYCApplications,
} from "../services/kycService.js";
import { z } from "zod";

// Validation schemas
const submitKYCSchema = z.object({
  company_name: z.string().min(1),
  company_registration_number: z.string().optional(),
  company_address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().min(1),
    postal_code: z.string().optional(),
  }),
  contact_person: z.string().min(1),
  contact_email: z.string().email(),
  contact_phone: z.string().min(1),
  verification_documents: z.array(
    z.object({
      type: z.string(),
      url: z.string().url(),
      name: z.string(),
    })
  ),
});

const reviewKYCSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  review_notes: z.string().optional(),
});

/**
 * POST /api/v1/users/:id/kyc
 * Submit KYC application
 */
router.post(
  "/users/:id/kyc",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const authenticatedUserId = (req as any).user?.id;

    // Users can only submit their own KYC
    if (userId !== authenticatedUserId) {
      throw new AuthorizationError("Cannot submit KYC for another user");
    }

    const validated = submitKYCSchema.parse(req.body);

    const application = await submitKYCApplication({
      user_id: userId,
      ...validated,
    });

    res.status(201).json({ data: application });
});

/**
 * GET /api/v1/users/:id/kyc
 * Get KYC status
 */
const getKYC = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const authenticatedUserId = (req as any).user?.id;
    const isAdmin = (req as any).user?.role === "admin";

    // Users can only view their own KYC, or admins can view any
    if (userId !== authenticatedUserId && !isAdmin) {
      throw new AuthorizationError("Cannot view KYC for another user");
    }

    const status = await getKYCStatus(userId);

    res.json({ data: status });
  })
);

/**
 * PATCH /api/v1/admin/kyc/:id
 * Admin review of KYC application
 */
router.patch(
  "/admin/kyc/:id",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const applicationId = req.params.id;
    const reviewerId = (req as any).user?.id;
    const isAdmin = (req as any).user?.role === "admin";

    if (!isAdmin) {
      throw new AuthorizationError("Admin access required");
    }

    const validated = reviewKYCSchema.parse(req.body);

    const application = await reviewKYCApplication({
      application_id: applicationId,
      status: validated.status,
      review_notes: validated.review_notes,
      reviewed_by: reviewerId,
    });

    res.json({ data: application });
});

/**
 * GET /api/v1/admin/kyc/pending
 * Get all pending KYC applications (admin only)
 */
const getPendingKYC = asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = (req as any).user?.role === "admin";

    if (!isAdmin) {
      throw new AuthorizationError("Admin access required");
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await getPendingKYCApplications(limit, offset);

    res.json(result);
});

/**
 * GET /api/v1/users/:id/kyc/verify
 * Verify user access (check KYC status)
 */
const verifyKYC = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const requiredRole = req.query.role as "supplier" | "buyer" | undefined;

    const hasAccess = await verifyUserAccess(userId, requiredRole);

    res.json({
      has_access: hasAccess,
      user_id: userId,
      required_role: requiredRole,
    });
});

/**
 * Register KYC routes
 */
export function registerKYCRoutes(app: Express): void {
  app.post("/api/v1/users/:id/kyc", requireAuth, submitKYC);
  app.get("/api/v1/users/:id/kyc", requireAuth, getKYC);
  app.patch("/api/v1/admin/kyc/:id", requireAuth, reviewKYC);
  app.get("/api/v1/admin/kyc/pending", requireAuth, getPendingKYC);
  app.get("/api/v1/users/:id/kyc/verify", requireAuth, verifyKYC);
}

