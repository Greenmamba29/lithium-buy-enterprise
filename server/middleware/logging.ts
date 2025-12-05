import { type Request, type Response, type NextFunction } from "express";
import { nanoid } from "nanoid";
import { createRequestLogger } from "../utils/logger.js";

/**
 * Request logging middleware
 * Adds request ID and logs all requests
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = req.headers["x-request-id"] as string || nanoid();
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-ID", requestId);

  const requestLogger = createRequestLogger(
    requestId,
    req.method,
    req.path
  );

  const start = Date.now();

  // Log request
  requestLogger.info({
    ip: req.ip,
    userAgent: req.get("user-agent"),
    query: req.query,
  }, "Incoming request");

  // Capture response
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    const duration = Date.now() - start;
    
    requestLogger.info({
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: JSON.stringify(body).length,
    }, "Request completed");

    return originalJson(body);
  };

  next();
}




