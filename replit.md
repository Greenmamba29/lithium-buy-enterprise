# LithiumBuy - Enterprise Lithium Marketplace

## Overview

LithiumBuy is a high-performance B2B marketplace directory for the global lithium supply chain. The platform connects procurement professionals, mining companies, materials traders, and battery manufacturers with verified lithium suppliers worldwide. It features a commission-based business model with curated supplier listings, advanced filtering and comparison tools, integrated video negotiation (Telebuy), and an AI-powered image studio for visual content generation.

The application targets enterprise users seeking battery-grade lithium materials, emphasizing trust signals (verification tiers, ratings, certifications), transparent pricing with bulk discounts, and streamlined sourcing workflows from search to transaction completion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- **React 19** with TypeScript for type-safe component development
- **Vite** as the build tool and development server with HMR support
- **Wouter** for lightweight client-side routing
- **TanStack Query v5** for server state management and data fetching

**UI Component System:**
- **shadcn/ui** components built on Radix UI primitives for accessible, composable UI elements
- **Tailwind CSS** for utility-first styling with custom design tokens
- Component library follows the "New York" style variant
- Custom glass-morphism effects (`glass-card`, `glass-card-3d`) for premium visual aesthetic

**Design System:**
- Warm stone-based color palette with refined luxury aesthetic
- Light mode: Stone-50 to stone-100 backgrounds with stone-900 text
- Dark mode: Near-black (stone-950) backgrounds with stone-100 text
- Gold accent color (#DDA826) for primary CTA and premium highlights
- Hero section features lithium crystal background image with gradient overlays
- Typography: Playfair Display (serif) for headings, Inter (sans) for body text
- Dark/light theme support with CSS custom properties
- Gold gradient text effects with `gold-gradient-text` class
- Luxury animations: fade-in, slide-up, float, pulse-glow
- Verification tier color coding (Gold/Silver/Bronze) for trust indicators

**State Management Pattern:**
- Local component state with React hooks for UI interactions
- URL state for filters and search queries (enables deep linking)
- In-memory mock data (suppliers, reviews) - designed for future API integration
- Compare functionality uses local state to track selected suppliers (max 4)

### Backend Architecture

**Server Framework:**
- **Express.js** with TypeScript on Node.js
- HTTP server creation with built-in support for future WebSocket integration
- Middleware: JSON parsing, URL encoding, request logging with timestamps
- Static file serving for production builds

**API Design:**
- RESTful API structure with `/api` prefix for all application routes
- Separation of concerns: `routes.ts` for endpoint definitions, `storage.ts` for data layer abstraction
- Currently uses in-memory storage (`MemStorage`) - designed for easy swap to persistent database
- Interface-based storage pattern (`IStorage`) allows multiple implementations without route changes

**Build & Deployment:**
- Custom build script using esbuild for server bundling
- Dependency bundling strategy with allowlist for critical packages (reduces cold start time)
- Separate client (Vite) and server (esbuild) build processes
- Production serves static client build from Express

### Data Storage Solutions

**Current Implementation:**
- In-memory storage for development with `MemStorage` class
- Mock supplier data with comprehensive attributes (verification tiers, pricing, location, certifications)
- User authentication schema defined but not fully implemented

**Prepared Database Schema:**
- **Drizzle ORM** configured with PostgreSQL dialect
- Schema location: `shared/schema.ts` for isomorphic access
- Users table with UUID primary keys, username/password fields
- Zod validation schemas derived from Drizzle tables
- Migration support configured via `drizzle-kit`

**Database Connection:**
- Neon Serverless PostgreSQL adapter for production
- Connection pooling through `@neondatabase/serverless`
- Environment-based configuration via `DATABASE_URL`

### Authentication & Authorization

**Planned Implementation:**
- Passport.js setup for authentication middleware
- Local strategy for username/password authentication
- Express session management with `connect-pg-simple` for PostgreSQL-backed sessions
- JWT support for token-based auth (dependencies installed)
- User model includes hashed password storage (bcrypt pattern expected)

**Current State:**
- Authentication routes not yet implemented in `routes.ts`
- Storage interface includes user CRUD methods
- Frontend has no protected routes or auth UI yet

### External Dependencies

**Third-Party Services (Prepared):**

1. **Video Conferencing Integration:**
   - Telebuy flow designed for Zoom/Calendly integration
   - UI components built for scheduling and DocuSign contract signing
   - Not yet connected to external APIs

2. **AI Image Generation (Lithium AI Studio):**
   - Dedicated route at `/ai-studio` with premium glass morphism design
   - Drag-and-drop image upload with preview and clear functionality
   - Prompt-based AI editing interface with example prompts
   - Feature cards: AI Enhancement, Background Removal, Style Transfer, Instant Results
   - Google Generative AI (`@google/genai`) SDK installed for Gemini integration
   - Loading state with animated spinner and "REFINING PIXELS..." message
   - Download functionality for generated images
   - Currently using mock implementation - requires `GEMINI_API_KEY` for production

3. **Payment Processing:**
   - Stripe SDK installed but not implemented
   - Commission structure (3-5%) displayed in Telebuy UI
   - No actual payment flows connected

4. **Email Notifications:**
   - Nodemailer dependency present but unconfigured
   - Likely for order confirmations, quote requests

**UI Component Libraries:**
- 20+ Radix UI primitives for accessibility (dialogs, dropdowns, tooltips, etc.)
- Lucide React for consistent iconography
- React Icons for brand icons (LinkedIn, X/Twitter)
- Embla Carousel for similar suppliers display

**Development Tools:**
- Replit-specific plugins for runtime error overlay, dev banner, and source mapping
- ESBuild for fast server bundling
- PostCSS with Autoprefixer for CSS processing

**Data Utilities:**
- date-fns for date formatting and manipulation
- nanoid for unique ID generation
- zod for runtime validation
- zod-validation-error for user-friendly error messages

**Production Optimization:**
- Express rate limiting middleware installed
- CORS support for cross-origin requests
- Compression and security headers expected in production configuration