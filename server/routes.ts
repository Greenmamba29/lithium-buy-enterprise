import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerHealthRoutes } from "./routes/health.js";
import { registerSupplierRoutes } from "./routes/suppliers.js";
import { registerQuoteRoutes } from "./routes/quotes.js";
import { registerReviewRoutes } from "./routes/reviews.js";
import { registerSearchRoutes } from "./routes/search.js";
import { registerAIStudioRoutes } from "./routes/aiStudio.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { registerTelebuyRoutes } from "./routes/telebuy.js";
import { registerPerplexityRoutes } from "./routes/perplexity.js";
import { registerAuctionRoutes } from "./routes/auctions.js";
import { registerRFQRoutes } from "./routes/rfq.js";
import { registerContentRoutes } from "./routes/content.js";
import { registerKYCRoutes } from "./routes/kyc.js";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check routes (no /api prefix)
  registerHealthRoutes(app);

  // API routes - all prefixed with /api
  registerSupplierRoutes(app);
  registerQuoteRoutes(app);
  registerReviewRoutes(app);
  registerSearchRoutes(app);
  registerAIStudioRoutes(app);
  registerAdminRoutes(app);
  registerTelebuyRoutes(app);
  registerPerplexityRoutes(app);
  registerAuctionRoutes(app);
  registerRFQRoutes(app);
  registerContentRoutes(app);
  registerKYCRoutes(app);

  return httpServer;
}
