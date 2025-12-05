import { type Express, type Request, type Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/auth.js";
import {
  generateContent,
  getGeneratedContent,
  listGeneratedContent,
  updateContentStatus,
  createContentVersion,
} from "../services/contentGenerationService.js";
import { generateEbook } from "../services/ebookService.js";
import { publishBlog, getBlogPublishingStatus } from "../services/blogService.js";
import { z } from "zod";

const generateContentSchema = z.object({
  template_id: z.string().uuid().optional(),
  content_type: z.enum(["ebook", "blog", "report", "newsletter", "whitepaper"]),
  title: z.string().min(1),
  source_data: z
    .object({
      market_data: z.any().optional(),
      report_sections: z.array(z.string()).optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  metadata: z
    .object({
      author: z.string().optional(),
      tags: z.array(z.string()).optional(),
      categories: z.array(z.string()).optional(),
    })
    .optional(),
});

/**
 * POST /api/content/generate
 * Generate new content
 */
export const generateContentRoute = asyncHandler(async (req: Request, res: Response) => {
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  const body = generateContentSchema.parse(req.body);

  const content = await generateContent(user_id, body);

  res.status(201).json({ data: content });
});

/**
 * GET /api/content
 * List generated content
 */
export const listContent = asyncHandler(async (req: Request, res: Response) => {
  const user_id = (req as any).user?.id;
  const content_type = req.query.content_type as string | undefined;
  const status = req.query.status as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const result = await listGeneratedContent({
    user_id,
    content_type,
    status,
    limit,
    offset,
  });

  res.json({
    data: result.data,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  });
});

/**
 * GET /api/content/:id
 * Get content details
 */
export const getContent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  const content = await getGeneratedContent(id, user_id);
  res.json({ data: content });
});

/**
 * POST /api/content/:id/status
 * Update content status
 */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  if (!["draft", "review", "approved", "published", "archived"].includes(status)) {
    throw new Error("Invalid status");
  }

  const content = await updateContentStatus(id, status, user_id);
  res.json({ data: content });
});

/**
 * POST /api/content/:id/version
 * Create content version
 */
export const createVersion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = (req as any).user?.id;

  if (!user_id) {
    throw new Error("Authentication required");
  }

  const version = await createContentVersion(id, user_id);
  res.json({ data: version });
});

/**
 * POST /api/content/:id/ebook
 * Generate ebook from content
 */
export const generateEbookRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const ebook = await generateEbook(id);
  res.json({ data: ebook });
});

/**
 * POST /api/content/:id/publish
 * Publish content to external platform
 */
export const publishContent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { platform } = req.body;

  if (!["website", "medium", "linkedin"].includes(platform)) {
    throw new Error("Invalid platform");
  }

  const publishing = await publishBlog(id, platform);
  res.json({ data: publishing });
});

/**
 * GET /api/content/:id/publishing
 * Get publishing status
 */
export const getPublishingStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const status = await getBlogPublishingStatus(id);
  res.json({ data: status });
});

/**
 * Register content routes
 */
export function registerContentRoutes(app: Express) {
  app.post("/api/content/generate", requireAuth, generateContentRoute);
  app.get("/api/content", requireAuth, listContent);
  app.get("/api/content/:id", requireAuth, getContent);
  app.post("/api/content/:id/status", requireAuth, updateStatus);
  app.post("/api/content/:id/version", requireAuth, createVersion);
  app.post("/api/content/:id/ebook", requireAuth, generateEbookRoute);
  app.post("/api/content/:id/publish", requireAuth, publishContent);
  app.get("/api/content/:id/publishing", requireAuth, getPublishingStatus);
}
