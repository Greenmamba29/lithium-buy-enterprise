import { type Express, type Request, type Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { ValidationError } from "../utils/errors.js";
import { enhanceImage, describeImage } from "../services/geminiService.js";
import { z } from "zod";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new ValidationError("Only image files are allowed"));
    }
  },
});

const enhanceImageSchema = z.object({
  prompt: z.string().min(1).max(500),
});

/**
 * POST /api/ai-studio/enhance
 * Enhance an image using Gemini AI
 */
export const enhanceImageHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const body = enhanceImageSchema.parse(req.body);
    const file = (req as any).file;

    if (!file) {
      throw new ValidationError("Image file is required");
    }

    const enhancedImage = await enhanceImage(file.buffer, body.prompt);

    // In a real implementation, you would:
    // 1. Process the image with Gemini
    // 2. Save the result to Supabase Storage
    // 3. Return the URL

    res.json({
      data: {
        enhancedImageUrl: enhancedImage, // Placeholder
        prompt: body.prompt,
      },
    });
  }
);

/**
 * POST /api/ai-studio/describe
 * Get AI description of an image
 */
export const describeImageHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const file = (req as any).file;

    if (!file) {
      throw new ValidationError("Image file is required");
    }

    const description = await describeImage(file.buffer);

    res.json({
      data: {
        description,
      },
    });
  }
);

/**
 * Register AI Studio routes
 */
export function registerAIStudioRoutes(app: Express) {
  app.post(
    "/api/ai-studio/enhance",
    upload.single("image"),
    enhanceImageHandler
  );
  app.post(
    "/api/ai-studio/describe",
    upload.single("image"),
    describeImageHandler
  );
}




