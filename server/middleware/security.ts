import { type Express, type Request, type Response, type NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";

/**
 * Security middleware configuration
 * Implements enterprise-grade security headers and CORS
 */
export function setupSecurity(app: Express) {
  // Helmet.js - Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
            "data:",
          ],
          scriptSrc: [
            "'self'",
            process.env.NODE_ENV === "development" ? "'unsafe-eval'" : "",
          ].filter(Boolean),
          imgSrc: [
            "'self'",
            "data:",
            "https:",
            "blob:",
          ],
          connectSrc: [
            "'self'",
            process.env.SUPABASE_URL || "",
            "https://*.supabase.co",
            "https://api.openai.com",
            "https://generativelanguage.googleapis.com",
          ].filter(Boolean),
          frameSrc: [
            "'self'",
            "https://*.daily.co",
            "https://*.docusign.net",
          ],
        },
      },
      crossOriginEmbedderPolicy: false, // Allow embedding for video calls
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      xFrameOptions: { action: "sameorigin" },
      xContentTypeOptions: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
  );

  // CORS configuration
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : process.env.NODE_ENV === "production"
      ? [] // Must be explicitly set in production
      : ["http://localhost:5000", "http://localhost:5173"];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRF-Token",
      ],
      exposedHeaders: ["X-Request-ID"],
    })
  );

  // Request size limits
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Limit JSON payload size to 10MB
    if (req.headers["content-type"]?.includes("application/json")) {
      const contentLength = parseInt(req.headers["content-length"] || "0", 10);
      if (contentLength > 10 * 1024 * 1024) {
        return res.status(413).json({ error: "Payload too large" });
      }
    }
    next();
  });
}




