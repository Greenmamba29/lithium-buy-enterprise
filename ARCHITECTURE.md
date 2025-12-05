# LithiumBuy Enterprise - System Architecture

## Overview

LithiumBuy Enterprise is a B2B marketplace directory for the global lithium supply chain. The platform connects procurement professionals, mining companies, and battery manufacturers with verified lithium suppliers worldwide. It follows a modern full-stack architecture with a React frontend and Express backend, designed for scalability and maintainability.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React 19   │  │ TanStack     │  │   Wouter     │      │
│  │   + TS 5.6   │  │   Query v5   │  │   Router     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│  ┌────────────────────────────────────────────────────┐     │
│  │           shadcn/ui (Radix UI Primitives)          │     │
│  │              Tailwind CSS Styling                  │     │
│  └────────────────────────────────────────────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/HTTPS
                             │ REST API (/api/*)
┌────────────────────────────┴────────────────────────────────┐
│                      Server Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Express    │  │   Routes     │  │   Storage    │      │
│  │   + TS       │  │   Handler    │  │   Interface  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│  ┌────────────────────────────────────────────────────┐     │
│  │         IStorage Interface (Abstraction)           │     │
│  │  ┌──────────────┐          ┌──────────────┐       │     │
│  │  │  MemStorage  │          │   (Future)   │       │     │
│  │  │  (Current)   │          │  PostgreSQL  │       │     │
│  │  └──────────────┘          └──────────────┘       │     │
│  └────────────────────────────────────────────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Drizzle    │  │   Zod        │  │   Shared     │      │
│  │     ORM      │  │ Validation   │  │   Schema     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  (Future) PostgreSQL Database (Neon Serverless)             │
└──────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

**Core Framework:**
- React 19.2 - UI library with latest features
- TypeScript 5.6 - Type safety and developer experience
- Vite 5.4 - Build tool with fast HMR

**State Management:**
- TanStack Query v5 - Server state management and caching
- React Hooks - Local component state
- URL State - Filter and search parameters for deep linking

**Routing:**
- Wouter 3.3.5 - Lightweight client-side routing (7KB)

**UI Components:**
- shadcn/ui - Accessible component library
- Radix UI - Unstyled, accessible primitives
- Tailwind CSS 3.4 - Utility-first styling
- Framer Motion 11.13 - Animation library
- Lucide React - Icon library

**Styling System:**
- CSS Custom Properties - Theme variables
- Tailwind Config - Custom design tokens
- Dark/Light mode - System preference with manual override

### Backend

**Server:**
- Express.js 4.21 - Web framework
- Node.js 20+ - Runtime environment
- TypeScript - Type-safe server code

**Database:**
- Supabase (PostgreSQL 17.4.1) - Production database
- Supabase client libraries for type-safe queries
- Row Level Security (RLS) enabled on all LithiumBuy tables
- Drizzle ORM 0.39 - Type-safe query builder (legacy, migrating to Supabase)
- Zod 3.24 - Runtime validation

**Storage:**
- In-memory storage (current) - `MemStorage` class
- Interface-based abstraction - `IStorage` interface for easy swapping

**Build & Deployment:**
- esbuild - Fast server bundling
- Vite - Client bundling
- Custom build script - Orchestrates both builds

### External Services

- **Supabase** - Database, Authentication, and Realtime (CONNECTED)
- **Accio** - Supplier data sourced manually from Accio reports (no API available)
- Google Gemini 2.5 Flash - AI image generation (prepared, requires API key)
- Stripe - Payment processing (prepared, not connected)
- Zoom/Calendly - Video conferencing (prepared, not connected)
- DocuSign - Contract signing (prepared, not connected)
- Nodemailer - Email notifications (prepared, not configured)

## System Components

### Frontend Architecture

#### Component Hierarchy

```
App
├── Header (Navigation, Theme Toggle)
├── Router (Route Configuration)
│   ├── Home (/)
│   │   ├── HeroSection
│   │   ├── FilterSidebar
│   │   ├── DirectoryGrid
│   │   ├── CompareBar
│   │   └── ComparisonTable
│   ├── SupplierDetail (/supplier/:id)
│   │   └── SupplierProfile
│   ├── Compare (/compare)
│   │   └── ComparisonTable
│   ├── Telebuy (/telebuy)
│   │   └── TelebuyFlow
│   └── AIStudio (/ai-studio)
│       └── AI Image Editor
└── Footer
```

#### Key Components

**Pages:**
- `Home.tsx` - Main directory with filtering and search
- `SupplierDetail.tsx` - Individual supplier profile page
- `Compare.tsx` - Side-by-side supplier comparison
- `Telebuy.tsx` - Video call scheduling and negotiation
- `AIStudio.tsx` - AI-powered image editing (mock implementation)

**Shared Components:**
- `SupplierCard.tsx` - Supplier listing card with verification badge
- `FilterSidebar.tsx` - Advanced filtering with accordion UI
- `ComparisonTable.tsx` - Tabular comparison view
- `QuickViewModal.tsx` - Quick supplier preview
- `Header.tsx` - Navigation and theme toggle
- `Footer.tsx` - Site footer

**UI Primitives (shadcn/ui):**
- 40+ accessible components (buttons, dialogs, forms, etc.)
- Built on Radix UI for WCAG compliance
- Consistent styling via Tailwind

#### State Management Pattern

1. **Server State:** TanStack Query manages API data
   - Automatic caching and background refetching
   - Optimistic updates support
   - Request deduplication

2. **Local State:** React hooks for UI interactions
   - Filter state, modal visibility, form inputs
   - Theme preference (stored in localStorage)

3. **URL State:** Query parameters for filters/search
   - Enables deep linking and bookmarking
   - Browser back/forward navigation

4. **Mock Data:** Currently hardcoded in `client/src/data/suppliers.ts`
   - 300+ lines of supplier mock data
   - Designed to be replaced with API calls

#### Data Flow

```
User Interaction
    ↓
Component Event Handler
    ↓
State Update (useState/useQuery)
    ↓
Re-render with New State
    ↓
UI Update
```

For API calls (future):
```
Component
    ↓
TanStack Query Hook
    ↓
apiRequest() utility
    ↓
HTTP Request to /api/*
    ↓
Express Route Handler
    ↓
Storage Interface
    ↓
Data Source (Memory/DB)
```

### Backend Architecture

#### Server Structure

```
server/
├── index.ts        # Server setup, middleware, startup
├── routes.ts       # API route definitions (currently empty)
├── storage.ts      # Storage interface and implementation
├── static.ts       # Static file serving for production
└── vite.ts         # Vite dev middleware setup
```

#### Request Flow

```
HTTP Request
    ↓
Express Middleware Stack
├── JSON Parser
├── URL Encoder
├── Request Logger
└── Route Handler
    ↓
API Route (routes.ts)
    ↓
Storage Interface (IStorage)
    ↓
Storage Implementation (MemStorage/PostgreSQL)
    ↓
Response
```

#### API Design (Planned)

All API routes should be prefixed with `/api`:

- `GET /api/suppliers` - List suppliers with filtering
- `GET /api/suppliers/:id` - Get supplier details
- `POST /api/suppliers/:id/quote` - Request quote
- `GET /api/suppliers/:id/reviews` - Get reviews
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration

Currently, `routes.ts` is empty and all data comes from mock files.

#### Storage Layer

**Interface Pattern:**
```typescript
interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // Future: supplier CRUD methods
}
```

**Current Implementation:**
- `MemStorage` - In-memory Map-based storage
- Data lost on server restart
- Good for development, not production

**Future Implementation:**
- PostgreSQL storage via Drizzle ORM
- Same interface, swap implementation
- No route changes needed

### Database Schema

**Supabase Database (Production):**
- Project ID: `vuekwckknfjivjighhfd`
- PostgreSQL 17.4.1
- All LithiumBuy tables deployed with RLS policies
- Schema migrations applied: `001_initial_schema.sql`, `002_indexes.sql`, `003_rls_policies.sql`
- TypeScript types generated in `shared/supabase-schema.ts`

**LithiumBuy Tables:**
1. `suppliers` - Core supplier information
2. `supplier_profiles` - Extended supplier details
3. `locations` - Supplier locations with geolocation support
4. `products` - Product catalog with pricing
5. `certifications` - Supplier certifications
6. `reviews` - Customer reviews
7. `quotes` - Quote requests and responses
8. `orders` - Order management
9. `telebuy_sessions` - Video call sessions
10. `telebuy_documents` - Documents from telebuy sessions
11. `user_profiles` - Extended user information (extends auth.users)

**Current Schema (`shared/schema.ts`):**

```typescript
users {
  id: varchar (UUID, primary key)
  username: text (unique, not null)
  password: text (not null, should be hashed)
}
```

**Planned Schema Extensions:**
- Suppliers table
- Products table
- Reviews table
- Orders/Quotes table
- Certifications table

### Build Process

#### Development Build

1. **Client:** Vite dev server with HMR
   - Fast refresh on file changes
   - Source maps for debugging
   - Proxy to Express server for API

2. **Server:** tsx runs TypeScript directly
   - No compilation step
   - Fast startup
   - Type checking on-the-fly

#### Production Build

1. **Client Build:**
   ```bash
   vite build
   ```
   - Outputs to `dist/public/`
   - Code splitting and minification
   - Asset optimization

2. **Server Build:**
   ```bash
   esbuild server/index.ts → dist/index.cjs
   ```
   - Bundles server code
   - Bundles critical dependencies (allowlist)
   - Reduces cold start time
   - CommonJS format for Node.js

3. **Deployment:**
   - Serve static files from `dist/public/`
   - Run server from `dist/index.cjs`
   - Environment variables required

### Configuration

#### Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

Optional:
- `GEMINI_API_KEY` - For AI Studio functionality
- `SESSION_SECRET` - For session management
- `STRIPE_API_KEY` - For payment processing

#### Configuration Files

- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.ts` - Tailwind design tokens
- `drizzle.config.ts` - Database migration config
- `package.json` - Dependencies and scripts

## Design Patterns

### 1. Interface Segregation

Storage layer uses interface to abstract implementation:
```typescript
interface IStorage { ... }
class MemStorage implements IStorage { ... }
// Future: class PostgreSQLStorage implements IStorage { ... }
```

### 2. Dependency Injection

Routes receive storage instance via closure or parameter:
```typescript
export async function registerRoutes(httpServer, app) {
  // storage is available in scope
  // Routes use storage interface
}
```

### 3. Component Composition

React components compose smaller pieces:
- `SupplierCard` uses `VerificationBadge`, `StarRating`
- Pages compose multiple components
- UI primitives compose into complex UIs

### 4. Separation of Concerns

- **Routes** - Handle HTTP requests/responses
- **Storage** - Data persistence logic
- **Components** - UI rendering and interaction
- **Utils** - Pure functions and helpers

### 5. Type Safety

TypeScript throughout:
- Shared types in `shared/schema.ts`
- Zod schemas for runtime validation
- Drizzle generates types from schema

## Security Architecture

### Current State

**Implemented:**
- JSON body parsing with size limits
- Basic error handling middleware
- Type-safe input validation (Zod)

**Missing:**
- Authentication/authorization
- Rate limiting
- CSRF protection
- Security headers (CSP, HSTS, etc.)
- Input sanitization beyond Zod
- SQL injection prevention (Drizzle helps, but not enforced)

### Planned Security Measures

1. **Authentication:**
   - Passport.js with local strategy
   - Session-based auth with PostgreSQL store
   - JWT for API tokens (optional)

2. **Authorization:**
   - Role-based access control (RBAC)
   - Protected routes middleware
   - Supplier verification workflows

3. **API Protection:**
   - Rate limiting (express-rate-limit installed)
   - CORS configuration
   - Request size limits
   - Input validation middleware

4. **Data Protection:**
   - Password hashing (bcrypt)
   - Environment variable secrets
   - HTTPS enforcement
   - SQL injection prevention (Drizzle parameterized queries)

## Performance Considerations

### Frontend Optimizations

- Code splitting via Vite
- Lazy loading routes (potential)
- Image optimization (missing)
- Virtual scrolling for long lists (missing)
- Memoization of expensive computations (`useMemo`)

### Backend Optimizations

- Dependency bundling reduces cold starts
- Connection pooling (Neon Serverless)
- Query optimization with Drizzle
- Caching strategy (not implemented)

### Current Bottlenecks

1. **Large mock data:** 300+ line supplier array loaded every render
2. **No pagination:** All suppliers loaded at once
3. **No API caching:** Would help when API is connected
4. **No image lazy loading:** All images load immediately
5. **No virtualization:** Long lists render all items

## Deployment Architecture

### Development

```
Developer Machine
    ↓
npm run dev
    ↓
┌─────────────────────┐
│  Vite Dev Server    │  Port 5000 (HMR enabled)
│  └─ Proxy ──────────┼───→ Express Server (tsx)
└─────────────────────┘      Port 5000 (API)
```

### Production

```
User Request
    ↓
Express Server (Port 5000)
├── Static Files (/ → dist/public/)
└── API Routes (/api/* → route handlers)
    └── Storage Layer
        └── PostgreSQL Database
```

### Deployment Platforms

- **Replit:** Current hosting platform
  - Autoscale deployment
  - PostgreSQL module available
  - Environment variable management

- **Future Options:**
  - Vercel (frontend) + Railway (backend)
  - AWS (S3 + Lambda + RDS)
  - DigitalOcean App Platform

## Scalability Considerations

### Current Limitations

1. **Single server:** No load balancing
2. **In-memory storage:** Data not persisted
3. **No caching:** Every request hits storage
4. **No CDN:** Static assets served from same server
5. **No queue system:** No async job processing

### Scaling Strategy

**Horizontal Scaling:**
- Multiple Express server instances
- Load balancer in front
- Stateless server design (sessions in DB)

**Database Scaling:**
- Read replicas for queries
- Connection pooling
- Query optimization and indexing

**Caching Layer:**
- Redis for session storage
- Redis for API response caching
- CDN for static assets

**Async Processing:**
- Job queue (Bull/BullMQ)
- Background workers for:
  - Email sending
  - Image processing
  - Report generation

## Monitoring & Observability

### Current State

- Basic console logging
- Request/response logging middleware
- No structured logging
- No error tracking
- No performance monitoring

### Recommended Tools

1. **Logging:** Winston or Pino
   - Structured JSON logs
   - Log levels
   - Log aggregation (Datadog, Loggly)

2. **Error Tracking:** Sentry
   - Error capture and alerting
   - Source maps for stack traces
   - Performance monitoring

3. **Metrics:** Prometheus + Grafana
   - Request rates
   - Response times
   - Error rates
   - Database query times

4. **APM:** New Relic or Datadog
   - Application performance monitoring
   - Database query analysis
   - Infrastructure metrics

## Future Architecture Considerations

### Potential Improvements

1. **Microservices:** Split into smaller services
   - Supplier service
   - Auth service
   - Payment service
   - AI service

2. **Event-Driven Architecture:**
   - Event bus for service communication
   - Async event processing
   - Event sourcing for audit trail

3. **GraphQL API:**
   - More flexible client queries
   - Reduced over-fetching
   - Real-time subscriptions

4. **Server-Side Rendering:**
   - Next.js or Remix migration
   - Better SEO
   - Faster initial page load

5. **Real-Time Features:**
   - WebSocket support (ws installed)
   - Live chat
   - Real-time notifications
   - Live supplier updates

## Conclusion

LithiumBuy Enterprise has a **solid architectural foundation** with modern technologies, clean separation of concerns, and scalability in mind. The interface-based storage pattern allows easy swapping from mock to real database. The frontend is well-structured with a comprehensive component library.

However, the backend is **incomplete** - routes are empty shells, authentication is not implemented, and the database is not connected. The architecture is ready for these implementations, but they need to be built out.

The codebase demonstrates good TypeScript usage, thoughtful component organization, and professional design patterns. With the planned backend implementation, this could be a production-ready B2B marketplace platform.

