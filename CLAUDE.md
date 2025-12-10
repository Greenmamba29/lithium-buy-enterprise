# CLAUDE.md - AI Assistant Guide for LithiumBuy Enterprise

## Project Overview

**LithiumBuy Enterprise** is a sophisticated B2B marketplace directory for the global lithium supply chain. It connects procurement professionals, mining companies, materials traders, and battery manufacturers with verified lithium suppliers worldwide.

**Repository:** https://github.com/Greenmamba29/lithium-buy-enterprise

**Live Status:** Production-ready frontend, fully-implemented backend with Supabase integration

### Key Features
- Advanced supplier directory with multi-criteria filtering
- Auction marketplace for spot lithium trades
- RFQ (Request for Quote) procurement platform
- Telebuy video negotiation workflow with DocuSign integration
- AI Studio for image enhancement (Gemini 2.5 Flash)
- Market intelligence powered by Perplexity AI
- Real-time price updates via WebSocket
- Enterprise-grade authentication and authorization

---

## Technology Stack

### Frontend
```json
{
  "Framework": "React 18.3 + TypeScript 5.6",
  "Build Tool": "Vite 5.4",
  "Routing": "Wouter 3.3 (lightweight 7KB router)",
  "State Management": "TanStack Query v5 (server state) + React Hooks (local state)",
  "UI Library": "shadcn/ui (Radix UI primitives)",
  "Styling": "Tailwind CSS 3.4 + CSS Custom Properties",
  "Animations": "Framer Motion 11.13",
  "Forms": "React Hook Form 7.55 + Zod 3.24 validation",
  "Icons": "Lucide React 0.453",
  "Auth": "Supabase JS 2.39"
}
```

### Backend
```json
{
  "Framework": "Express.js 4.21 + TypeScript 5.6",
  "Database": "Supabase (PostgreSQL 17.4.1)",
  "ORM": "Supabase client (primary) + Drizzle ORM (legacy)",
  "Auth": "Passport.js 0.7 + Supabase JWT",
  "Real-time": "WebSocket (ws 8.18)",
  "Jobs": "BullMQ 5.4 + Upstash Redis 1.29",
  "Logging": "Pino 8.17 + Pino Pretty 10.3",
  "Monitoring": "Sentry 8.0",
  "Security": "Helmet 7.1, CORS 2.8, Express Rate Limit 7.1",
  "Email": "Nodemailer 6.9",
  "AI": "Google Generative AI 0.21 (Gemini)"
}
```

### External Services
- **Supabase**: Database, Auth, Realtime (✓ Connected)
- **Perplexity AI**: Market intelligence (✓ Connected)
- **Stripe**: Payment processing (prepared, not connected)
- **Daily.co**: Video conferencing (prepared, not connected)
- **DocuSign**: Contract signing (prepared, not connected)
- **Gemini**: AI image generation (prepared, requires API key)

---

## Directory Structure

```
/
├── client/                      # React frontend
│   └── src/
│       ├── components/          # 25+ main components + 40+ UI components
│       │   ├── ui/             # shadcn/ui primitives (button, input, dialog, etc.)
│       │   ├── admin/          # Admin dashboard components
│       │   └── __tests__/      # Component tests
│       ├── pages/              # 11 main pages + admin pages
│       │   ├── Home.tsx        # Supplier directory with filtering
│       │   ├── SupplierDetail.tsx
│       │   ├── Auctions.tsx
│       │   ├── RFQ.tsx
│       │   ├── Telebuy.tsx
│       │   ├── AIStudio.tsx
│       │   ├── Login.tsx / Signup.tsx
│       │   └── admin/          # Admin dashboard pages
│       ├── hooks/              # 12 custom React hooks
│       │   ├── useAuth.ts
│       │   ├── useSuppliers.ts
│       │   ├── useWebSocket.ts
│       │   ├── useTelebuy.ts
│       │   └── ...
│       ├── lib/                # Utilities
│       │   ├── queryClient.ts  # TanStack Query config
│       │   └── utils.ts        # cn() helper
│       ├── data/               # Static/mock data
│       ├── App.tsx             # Main app with routing
│       └── main.tsx            # Entry point
│
├── server/                     # Express backend
│   ├── routes/                 # 12 API route handlers
│   │   ├── auctions.ts
│   │   ├── rfq.ts
│   │   ├── telebuy.ts
│   │   ├── suppliers.ts
│   │   ├── quotes.ts
│   │   ├── admin.ts
│   │   ├── search.ts
│   │   ├── perplexity.ts
│   │   └── ...
│   ├── services/               # 20+ business logic services
│   │   ├── auctionService.ts
│   │   ├── rfqService.ts
│   │   ├── perplexityService.ts
│   │   ├── websocketService.ts
│   │   ├── emailService.ts
│   │   └── ...
│   ├── middleware/             # 5 middleware files
│   │   ├── auth.ts            # Supabase JWT verification
│   │   ├── errorHandler.ts    # Centralized error handling
│   │   ├── security.ts        # Helmet + CORS
│   │   ├── rateLimit.ts
│   │   └── logging.ts
│   ├── db/                    # Database layer
│   │   ├── client.ts          # Supabase client
│   │   ├── migrate.ts         # Migration runner
│   │   └── migrations/        # 11 SQL migration files
│   ├── jobs/                  # Background jobs
│   │   ├── queue.ts
│   │   ├── perplexityDataSync.ts
│   │   └── postCallAutomation.ts
│   └── utils/                 # Utility functions
│       ├── errors.ts          # Custom error classes
│       ├── logger.ts          # Pino logger
│       ├── circuitBreaker.ts
│       ├── retry.ts
│       └── transactions.ts
│
├── shared/                    # Shared types/schemas
│   ├── schema.ts             # Drizzle ORM schema (legacy)
│   └── supabase-schema.ts    # Supabase table types
│
├── scripts/                  # Utility scripts
│   └── create-admin-user.ts
│
├── docs/                     # Comprehensive documentation
│   ├── ARCHITECTURE.md
│   ├── DEVELOPER_SETUP.md
│   ├── DEPLOYMENT.md
│   ├── TESTING.md
│   ├── SECURITY.md
│   ├── API.md
│   └── ADRs/                # Architecture Decision Records
│
└── Configuration Files
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── vitest.config.ts
    ├── tailwind.config.ts
    ├── drizzle.config.ts
    ├── netlify.toml
    ├── .eslintrc.js
    └── .env.example
```

---

## Key Architectural Patterns

### 1. Routing Architecture

**Frontend (Wouter - Client-Side)**
```typescript
// App.tsx - Lazy loaded routes for code splitting
const Home = lazy(() => import('@/pages/Home'));
const Auctions = lazy(() => import('@/pages/Auctions'));

<Router>
  <Route path="/" component={Home} />
  <Route path="/auctions" component={Auctions} />
  <Route path="/supplier/:id" component={SupplierDetail} />
  <Route path="/admin/dashboard" component={AdminDashboard} />
</Router>
```

**Backend (Express - RESTful API)**
- All routes under `/api/` prefix
- Organized by domain (auctions, RFQ, suppliers, etc.)
- Example: `POST /api/auctions`, `GET /api/suppliers`, `POST /api/rfq`

### 2. State Management

**Server State (TanStack Query)**
```typescript
// lib/queryClient.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,  // Manual invalidation
      gcTime: 5 * 60 * 1000,
      queryFn: getQueryFn({ on401: "throw" })
    }
  }
});
```

**Local State (React Hooks)**
- Component-level state with `useState`
- Filter state, modal visibility, form inputs

### 3. API Communication Pattern

**Client → Server**
```typescript
// All requests go through queryClient
// Automatically attaches Supabase auth token
const { data } = useQuery({
  queryKey: ['suppliers', filters],
  queryFn: () => apiRequest('GET', '/api/suppliers')
});
```

**Server Response Pattern**
```typescript
// Standardized response envelope
// Success: { data: T }
// Error: { error: { message, code, requestId } }

res.status(200).json({ data: result });
res.status(400).json({ error: { message: "Invalid input", code: "VALIDATION_ERROR" } });
```

### 4. Error Handling

**Custom Error Classes** (server/utils/errors.ts)
```typescript
class AppError extends Error { isOperational: true }
- ValidationError (400)
- AuthenticationError (401)
- AuthorizationError (403)
- NotFoundError (404)
- ConflictError (409)
- RateLimitError (429)
```

**Error Handler Middleware**
- Captures context (requestId, method, path, IP)
- Logs with Pino
- Sends to Sentry
- Hides internal details in production

### 5. Authentication & Authorization

**Frontend (Supabase Client)**
```typescript
// hooks/useAuth.ts
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('user_profiles')
  .select('role')
  .eq('user_id', user.id)
  .single();
```

**Backend (JWT Verification)**
```typescript
// middleware/auth.ts
export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error) throw new AuthenticationError();
  req.user = user;  // Attached for downstream use
  next();
});
```

### 6. Database Pattern

**Supabase Client (Primary)**
```typescript
// server/db/client.ts
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Bypasses RLS
);

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY  // Respects RLS
);
```

**Service Layer Example**
```typescript
// services/auctionService.ts
export async function createAuction(input: CreateAuctionInput) {
  const { data, error } = await supabaseAdmin
    .from('auctions')
    .insert(input)
    .select()
    .single();

  if (error) throw new DatabaseError(error.message);
  return data;
}
```

### 7. WebSocket Real-Time

**Server (WebSocket Service)**
```typescript
// services/websocketService.ts
export function broadcastToChannel(channel: string, message: any) {
  subscribers.get(channel)?.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
```

**Client (Custom Hook)**
```typescript
// hooks/useWebSocket.ts
const { subscribe, unsubscribe } = useWebSocket();

useEffect(() => {
  subscribe('auction-updates', handleAuctionUpdate);
  return () => unsubscribe('auction-updates');
}, []);
```

### 8. Transaction Pattern

**Multi-Step Transactions** (server/utils/transactions.ts)
```typescript
const result = await executeTransaction([
  {
    description: "Create auction",
    execute: async () => { /* ... */ },
    rollback: async () => { /* ... */ }
  },
  {
    description: "Create auction lots",
    execute: async () => { /* ... */ },
    rollback: async () => { /* ... */ }
  }
]);
```

---

## Code Conventions

### File Naming
| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase.tsx | `SupplierCard.tsx` |
| Pages | PascalCase.tsx | `Home.tsx` |
| Hooks | camelCase with 'use' | `useAuth.ts` |
| Services | camelCase + 'Service' | `auctionService.ts` |
| Routes | camelCase + 'Route' | `createAuctionRoute` |
| Utils | camelCase | `logger.ts` |
| Types | PascalCase | `User`, `Supplier` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_FILTERS` |

### Import Path Aliases
```typescript
// tsconfig.json paths
"@/*" → "./client/src/*"
"@shared/*" → "./shared/*"

// Usage
import { Button } from '@/components/ui/button';
import { insertUserSchema } from '@shared/schema';
```

### Component Pattern
```typescript
// Functional components with TypeScript
export default function SupplierCard({ supplier }: { supplier: Supplier }) {
  const [isComparing, setIsComparing] = useState(false);
  const { mutate: addToCompare } = useAddToCompare();

  return (
    <div className="p-6 bg-card rounded-lg border">
      {/* JSX */}
    </div>
  );
}
```

### Service Pattern
```typescript
// 1. Interface definitions
export interface CreateAuctionInput { /* ... */ }

// 2. Main exported function
export async function createAuction(input: CreateAuctionInput): Promise<Auction> {
  // Validate input
  const validated = createAuctionSchema.parse(input);

  // Call database
  const result = await supabaseAdmin.from('auctions').insert(validated);

  return result.data;
}

// 3. Helper functions (not exported)
async function validateTiming(start, end) { /* ... */ }
```

### Error Handling
```typescript
// Throw operational errors (expected)
if (!user) throw new AuthenticationError("User not authenticated");

// Programming errors bubble up to error handler
// Never catch and hide them
```

### Styling Convention
```typescript
// Use Tailwind utilities, not custom CSS
<div className="flex items-center justify-between gap-4 p-6 rounded-lg bg-card border">
  <h3 className="text-lg font-semibold text-foreground">Title</h3>
</div>

// Use cn() helper for conditional classes
import { cn } from '@/lib/utils';
<div className={cn("base-class", isActive && "active-class")} />
```

---

## Database Schema

### Connection Details
- **Platform**: Supabase (PostgreSQL 17.4.1)
- **Project ID**: `vuekwckknfjivjighhfd`
- **URL**: Set in `SUPABASE_URL` environment variable
- **Auth**: Service role key for admin, anon key for client

### Key Tables

**Core Tables**
- `users` - User accounts (via Supabase Auth)
- `user_profiles` - Extended user info (role, company, etc.)
- `suppliers` - Supplier directory with verification tiers
- `supplier_profiles` - Extended supplier details
- `products` - Product catalog with purity levels and pricing
- `locations` - Supplier locations with geolocation

**Auction Marketplace**
- `auctions` - Auction listings
- `auction_lots` - Individual lots within auctions
- `bids` - Bid history
- `auction_participants` - User participation tracking

**Procurement Platform**
- `rfqs` - Request for Quote submissions
- `rfq_products` - Products requested in RFQ
- `quotes` - Supplier responses to RFQs
- `quote_items` - Line items in quotes

**Telebuy & Transactions**
- `telebuy_sessions` - Video call sessions
- `telebuy_documents` - Documents from video calls
- `orders` - Transaction records
- `escrow_transactions` - Payment escrow tracking

**Content & Analytics**
- `market_data` - Perplexity AI market intelligence
- `price_snapshots` - Historical pricing data
- `reviews` - Supplier reviews and ratings
- `certifications` - Supplier certifications

### Migration Files
```
server/db/migrations/
├── 001_initial_schema.sql          # Core tables
├── 002_indexes.sql                 # Performance indexes
├── 003_rls_policies.sql            # Row Level Security
├── 004_audit_trail.sql             # Audit logging
├── 005_transaction_helpers.sql     # Transaction support
├── 006_auction_marketplace.sql     # Auction domain
├── 007_procurement_platform.sql    # RFQ domain
├── 008_market_intelligence.sql     # Analytics
├── 009_content_generation.sql      # AI content
├── 010_rls_policies_new_tables.sql # Additional RLS
└── 011_performance_indexes.sql     # Additional indexes
```

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies enforce user-level access control
- Admin users bypass RLS with service role key
- Example policy: Users can only view their own RFQs unless they're a supplier

---

## Development Workflows

### Initial Setup
```bash
# Clone and install
git clone https://github.com/Greenmamba29/lithium-buy-enterprise.git
cd lithium-buy-enterprise
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev  # Runs on http://localhost:5000
```

### Development Commands
```bash
npm run dev          # Start dev server (Vite + tsx)
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests with Vitest
npm run test:ui      # Open Vitest UI
npm run check        # TypeScript type checking
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run migrate      # Run database migrations
npm run create-admin # Create admin user
```

### Adding a New Feature

**1. Add API Endpoint**
```bash
# Create route handler
touch server/routes/myFeature.ts

# Create service
touch server/services/myFeatureService.ts

# Register route in server/routes.ts
```

**2. Add Database Table**
```bash
# Create migration
touch server/db/migrations/XXX_my_feature.sql

# Add RLS policies
# Update shared/supabase-schema.ts types
```

**3. Add Frontend Page**
```bash
# Create page component
touch client/src/pages/MyFeature.tsx

# Create hook (if needed)
touch client/src/hooks/useMyFeature.ts

# Add route in client/src/App.tsx
```

### Testing Workflow
```bash
# Run tests in watch mode
npm test -- --watch

# Run specific test
npm test -- supplier.test.ts

# Generate coverage report
npm run test:coverage
```

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/my-feature
git add .
git commit -m "feat: add my feature"
git push -u origin feature/my-feature

# Create PR via GitHub
```

### Deployment Workflow
```bash
# Build locally
npm run build

# Test production build
npm start

# Deploy via Netlify
# Commits to main trigger auto-deploy
```

---

## Common Tasks

### Task 1: Add a New Supplier Field

**1. Update Database**
```sql
-- server/db/migrations/XXX_add_supplier_field.sql
ALTER TABLE suppliers ADD COLUMN new_field TEXT;
```

**2. Update Types**
```typescript
// shared/supabase-schema.ts
export interface Supplier {
  // ... existing fields
  new_field?: string;
}
```

**3. Update Service**
```typescript
// server/services/supplierService.ts
// Add field to select queries
```

**4. Update Frontend**
```typescript
// client/src/components/SupplierCard.tsx
// Display new field
<p>{supplier.new_field}</p>
```

### Task 2: Add Real-Time Updates

**1. Server WebSocket Handler**
```typescript
// server/services/websocketService.ts
export function broadcastSupplierUpdate(supplierId: string, data: any) {
  broadcastToChannel('supplier-updates', { supplierId, data });
}
```

**2. Trigger Broadcast**
```typescript
// server/services/supplierService.ts
export async function updateSupplier(id: string, data: any) {
  // Update database
  const result = await supabase.from('suppliers').update(data);

  // Broadcast update
  broadcastSupplierUpdate(id, result.data);

  return result.data;
}
```

**3. Client Subscription**
```typescript
// client/src/hooks/useSuppliers.ts
const { subscribe } = useWebSocket();

useEffect(() => {
  subscribe('supplier-updates', (message) => {
    queryClient.invalidateQueries({ queryKey: ['suppliers'] });
  });
}, []);
```

### Task 3: Add New Admin Dashboard Widget

**1. Create Component**
```typescript
// client/src/components/admin/MyWidget.tsx
export default function MyWidget() {
  const { data } = useQuery({ queryKey: ['admin-stats'] });
  return <div>Widget content</div>;
}
```

**2. Add to Dashboard**
```typescript
// client/src/pages/admin/Dashboard.tsx
import MyWidget from '@/components/admin/MyWidget';

// Add to dashboard grid
<MyWidget />
```

**3. Create API Endpoint**
```typescript
// server/routes/admin.ts
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  const stats = await getAdminStats();
  res.json({ data: stats });
});
```

### Task 4: Implement Email Notification

**1. Create Email Template**
```typescript
// server/services/emailService.ts
export async function sendQuoteRequestEmail(to: string, data: any) {
  const html = `
    <h1>New Quote Request</h1>
    <p>You have received a quote request for ${data.productName}</p>
  `;

  return await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'New Quote Request',
    html
  });
}
```

**2. Trigger Email**
```typescript
// server/services/quoteService.ts
export async function createQuoteRequest(data: any) {
  const quote = await supabase.from('quotes').insert(data);

  // Send notification
  await sendQuoteRequestEmail(supplier.email, data);

  return quote.data;
}
```

---

## Testing Guidelines

### Test Structure
```
server/
├── __tests__/
│   ├── integration/      # Full flow tests
│   └── unit/             # Unit tests

client/src/
└── components/
    └── __tests__/        # Component tests
```

### Writing Tests

**Component Test**
```typescript
// client/src/components/__tests__/SupplierCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SupplierCard from '../SupplierCard';

describe('SupplierCard', () => {
  it('displays supplier name', () => {
    const supplier = { name: 'Test Supplier' };
    render(<SupplierCard supplier={supplier} />);
    expect(screen.getByText('Test Supplier')).toBeInTheDocument();
  });
});
```

**Integration Test**
```typescript
// server/__tests__/integration/auction.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../index';

describe('Auction API', () => {
  it('creates an auction', async () => {
    const response = await request(app)
      .post('/api/auctions')
      .send({ title: 'Test Auction' });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
  });
});
```

---

## Security Best Practices

### 1. Authentication
- Use Supabase JWT tokens for auth
- Never store passwords in plain text
- Use `requireAuth` middleware for protected routes
- Check user roles with `requireAdmin` or `requireSupplier`

### 2. Authorization
- Implement Row Level Security (RLS) policies
- Validate user ownership before updates/deletes
- Use service role key only in server-side code

### 3. Input Validation
- Always validate with Zod schemas
- Never trust client input
- Sanitize user-generated content

### 4. Rate Limiting
```typescript
// Applied to all API routes
rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // limit each IP to 100 requests per windowMs
})
```

### 5. Error Handling
- Never expose internal errors to clients
- Log all errors to Sentry
- Return generic error messages in production

### 6. Environment Variables
- Never commit `.env` to git
- Use `.env.example` for documentation
- Validate required env vars at startup

---

## Performance Optimization

### Frontend
1. **Code Splitting**: Lazy load routes with `React.lazy()`
2. **Query Caching**: TanStack Query caches all requests
3. **Image Optimization**: Use responsive images
4. **Virtual Scrolling**: For long lists (react-window)
5. **Memoization**: Use `useMemo` for expensive calculations

### Backend
1. **Database Indexes**: All foreign keys and frequently queried fields
2. **Connection Pooling**: Neon serverless handles automatically
3. **Caching**: Service-level caching for expensive queries
4. **Circuit Breaker**: Prevents cascading failures
5. **Job Queue**: BullMQ for async processing

### Database
1. **Indexes**: Created in migration 002 and 011
2. **RLS Policies**: Optimized for performance
3. **Query Optimization**: Use Supabase query builder
4. **Pagination**: Always paginate large result sets

---

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
lsof -ti:5000 | xargs kill -9
```

**Database Connection Failed**
- Verify `SUPABASE_URL` and keys in `.env`
- Check Supabase project status
- Verify network connectivity

**Build Fails**
```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

**TypeScript Errors**
```bash
# Run type check
npm run check

# Check specific file
npx tsc --noEmit client/src/pages/Home.tsx
```

**Tests Failing**
```bash
# Run with verbose output
npm test -- --reporter=verbose

# Run single test file
npm test -- supplier.test.ts
```

**WebSocket Not Connecting**
- Check WebSocket URL in client
- Verify WebSocket service is running
- Check CORS configuration

---

## Environment Variables

### Required
```env
# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Server
PORT=5000
NODE_ENV=development
```

### Optional
```env
# Perplexity AI (Market Intelligence)
PERPLEXITY_API_KEY=your_key
PERPLEXITY_MODEL=sonar-pro

# Redis (Job Queue)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sentry (Error Tracking)
SENTRY_DSN=https://...@sentry.io/...

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password

# Daily.co (Video)
DAILY_CO_API_KEY=your_key

# DocuSign (E-Signature)
DOCUSIGN_CLIENT_ID=your_id
DOCUSIGN_CLIENT_SECRET=your_secret

# Gemini (AI)
GEMINI_API_KEY=your_key

# Feature Flags
CONTENT_GENERATION_ENABLED=true
AUCTION_MARKETPLACE_ENABLED=true
PROCUREMENT_PLATFORM_ENABLED=true
```

---

## Design System

### Colors (Tailwind CSS)
```css
/* Primary */
--primary: 220 90% 50%;    /* Professional blue */
--primary-foreground: 0 0% 100%;

/* Accent */
--gold: 43 100% 67%;       /* Gold accents */
--orange: 25 95% 60%;      /* CTA buttons */

/* Verification Tiers */
--gold-badge: #D4AF37;
--silver-badge: #C0C0C0;
--bronze-badge: #CD7F32;

/* Theme (supports dark/light) */
--background: 0 0% 100%;
--foreground: 220 13% 13%;
--card: 0 0% 100%;
--card-foreground: 220 13% 13%;
```

### Typography
```typescript
// Fonts: Inter (headings/UI) + Source Sans Pro (body)
H1: "text-5xl font-bold"     // 48px, 700
H2: "text-4xl font-semibold" // 36px, 600
H3: "text-2xl font-semibold" // 24px, 600
Body: "text-base"            // 16px, 400
Small: "text-sm"             // 14px, 400
```

### Spacing
```typescript
// Tailwind units: 4, 6, 8, 12, 16, 20, 24
Section padding: "py-20"
Card padding: "p-6"
Component gap: "gap-4" or "gap-8"
```

### Components
- Use shadcn/ui components from `@/components/ui/`
- Follow Radix UI accessibility patterns
- Apply Tailwind utilities for styling
- Avoid custom CSS when possible

---

## CI/CD Pipeline

### GitHub Actions

**CI Workflow** (`.github/workflows/ci.yml`)
- Triggered on: Push to main/develop, PRs
- Steps: Install → Type Check → Lint → Test → Build

**Deploy Workflow** (`.github/workflows/deploy.yml`)
- Triggered on: Push to main
- Stages: Staging → Production (manual approval)
- Environment variables configured per environment

### Netlify Deployment
- Auto-deploy on push to main
- Build command: `npm run build`
- Publish directory: `dist/public`
- Serverless functions in Netlify Functions

---

## Additional Resources

### Documentation
- `ARCHITECTURE.md` - System architecture deep dive
- `docs/DEVELOPER_SETUP.md` - Detailed setup guide
- `docs/API.md` - API endpoint documentation
- `docs/TESTING.md` - Testing strategies
- `docs/SECURITY.md` - Security guidelines
- `docs/DEPLOYMENT.md` - Deployment instructions
- `docs/ADRs/` - Architecture Decision Records

### Design
- `design_guidelines.md` - Comprehensive design system
- Figma: (link if available)

### External Links
- [React 19 Docs](https://react.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Quick Reference

### Most Common Commands
```bash
npm run dev              # Start development
npm test                 # Run tests
npm run check            # Type check
npm run build            # Build for production
```

### Most Common Files to Edit
```
client/src/App.tsx                    # Add routes
client/src/pages/                     # Add/edit pages
client/src/components/                # Add/edit components
server/routes/                        # Add/edit API endpoints
server/services/                      # Add/edit business logic
server/db/migrations/                 # Add database changes
```

### Most Common Patterns
```typescript
// Query data
const { data, isLoading } = useQuery({ queryKey: ['key'], queryFn: fn });

// Mutate data
const { mutate } = useMutation({ mutationFn: fn, onSuccess: () => {} });

// Create API endpoint
export const myRoute = asyncHandler(async (req, res) => {
  const data = await myService();
  res.json({ data });
});

// Throw error
throw new ValidationError("Error message");
```

---

## Contact & Support

- **Repository Issues**: https://github.com/Greenmamba29/lithium-buy-enterprise/issues
- **Documentation**: Check `docs/` folder
- **Architecture Questions**: See `ARCHITECTURE.md`

---

**Last Updated**: 2025-12-10

This guide is maintained to help AI assistants understand the codebase structure, conventions, and best practices for the LithiumBuy Enterprise platform. When working on this project, always refer to this document for guidance on code organization, naming conventions, and development workflows.
