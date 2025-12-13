# PHASE 1: DETAILED TASK BREAKDOWN
**Duration:** Weeks 1-2 (Dec 10-23, 2025)
**Status:** 🟡 IN PROGRESS
**Completion:** 0% (0/50 tasks)

---

## OVERVIEW

Phase 1 establishes the foundation for production deployment by completing:
1. API integrations with production credentials
2. Database security (Row Level Security policies)
3. Comprehensive test coverage (≥60%)
4. Automated CI/CD pipeline

**Critical Path:** API Keys → RLS Policies → Tests → CI/CD (14 days)

---

## WORKSTREAM 1: API KEYS & CONFIGURATION
**Owner:** Integration Lead
**Duration:** Days 1-2
**Priority:** P0 (BLOCKING)
**Complexity:** LOW

### Task 1.1.1: Daily.co API Key Setup
**Owner:** Integration Lead
**Estimated:** 2 hours
**Status:** ⚪ TODO

**Steps:**
1. Sign up for Daily.co account: https://www.daily.co/signup
2. Navigate to Developers → API Keys
3. Create new API key with scopes: rooms:create, rooms:read, meetings:create
4. Copy API key to secure location
5. Add to `.env` as `DAILY_CO_API_KEY=xxx`
6. Test connection with simple API call:
   ```bash
   curl https://api.daily.co/v1/rooms \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```
7. Update `/server/services/videoService.ts` with real key
8. Test room creation in dev environment

**Success Criteria:**
- [ ] Daily.co account created
- [ ] API key obtained
- [ ] Connection test successful
- [ ] Room creation working

**Files Modified:**
- `.env`
- `/server/services/videoService.ts`

**Blocker:** None

---

### Task 1.1.2: Stripe API Keys (Test + Prod)
**Owner:** Integration Lead
**Estimated:** 3 hours
**Status:** ⚪ TODO

**Steps:**
1. Sign up for Stripe account: https://stripe.com/register
2. Complete account verification (business info)
3. Navigate to Developers → API Keys
4. Copy Test keys:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`
5. Add to `.env`:
   ```
   STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_SECRET_KEY=sk_test_xxx
   ```
6. Setup webhook endpoint: https://your-domain.com/webhooks/stripe
7. Get webhook secret: `whsec_xxx`
8. Add `STRIPE_WEBHOOK_SECRET=whsec_xxx` to `.env`
9. Test payment intent creation:
   ```javascript
   const paymentIntent = await stripe.paymentIntents.create({
     amount: 1000,
     currency: 'usd',
   });
   ```
10. Verify webhook delivery in Stripe dashboard

**Success Criteria:**
- [ ] Stripe account created and verified
- [ ] Test API keys obtained
- [ ] Webhook endpoint configured
- [ ] Payment intent creation working
- [ ] Webhook events received

**Files Modified:**
- `.env`
- `/server/services/escrowService.ts`
- `/server/webhooks/stripe.ts` (new file)

**Blocker:** Account verification may take 1-2 business days

---

### Task 1.1.3: DocuSign OAuth Credentials
**Owner:** Integration Lead
**Estimated:** 4 hours
**Status:** ⚪ TODO

**Steps:**
1. Sign up for DocuSign Developer account: https://developers.docusign.com/
2. Create new application in Apps & Keys
3. Configure OAuth redirect URI: `https://your-domain.com/auth/docusign/callback`
4. Get Integration Key (Client ID)
5. Generate Secret Key (Client Secret)
6. Add to `.env`:
   ```
   DOCUSIGN_CLIENT_ID=xxx
   DOCUSIGN_CLIENT_SECRET=xxx
   DOCUSIGN_ACCOUNT_ID=xxx
   DOCUSIGN_BASE_PATH=https://demo.docusign.net
   ```
7. Implement OAuth flow in `/server/routes/auth.ts`
8. Test OAuth authorization
9. Test envelope creation with template

**Success Criteria:**
- [ ] DocuSign developer account created
- [ ] OAuth app configured
- [ ] OAuth flow working
- [ ] Envelope creation successful

**Files Modified:**
- `.env`
- `/server/services/docuSignService.ts`
- `/server/routes/auth.ts`

**Blocker:** OAuth flow complexity (may need 1-2 iterations)

---

### Task 1.1.4: Gemini API Key (Google Cloud)
**Owner:** Integration Lead
**Estimated:** 2 hours
**Status:** ⚪ TODO

**Steps:**
1. Create Google Cloud Project: https://console.cloud.google.com/
2. Enable Gemini API (AI Platform)
3. Create API key in Credentials
4. Add to `.env`: `GEMINI_API_KEY=xxx`
5. Test API call:
   ```javascript
   const response = await gemini.generateContent({
     model: 'gemini-2.5-flash',
     prompt: 'Test',
   });
   ```
6. Update `/server/services/geminiService.ts` with real key
7. Test image enhancement endpoint

**Success Criteria:**
- [ ] Google Cloud project created
- [ ] Gemini API enabled
- [ ] API key obtained
- [ ] Image processing working

**Files Modified:**
- `.env`
- `/server/services/geminiService.ts`

**Blocker:** None

---

### Task 1.1.5: Perplexity API Key
**Owner:** Data Lead
**Estimated:** 1 hour
**Status:** ⚪ TODO

**Steps:**
1. Sign up for Perplexity account: https://www.perplexity.ai/
2. Navigate to API settings
3. Generate new API key
4. Add to `.env`: `PERPLEXITY_API_KEY=xxx`
5. Set model: `PERPLEXITY_MODEL=sonar-pro`
6. Test market intelligence query:
   ```javascript
   const response = await perplexity.query({
     model: 'sonar-pro',
     messages: [{
       role: 'user',
       content: 'Latest lithium market prices'
     }]
   });
   ```
7. Update `/server/services/perplexityService.ts`

**Success Criteria:**
- [ ] Perplexity API key obtained
- [ ] Market intelligence query working
- [ ] Response parsed correctly

**Files Modified:**
- `.env`
- `/server/services/perplexityService.ts`

**Blocker:** None

---

### Task 1.1.6: SMTP Credentials (SendGrid/AWS SES)
**Owner:** Integration Lead
**Estimated:** 3 hours
**Status:** ⚪ TODO

**Steps:**
1. Choose provider: SendGrid (recommended) or AWS SES
2. **Option A - SendGrid:**
   - Sign up: https://signup.sendgrid.com/
   - Verify email domain
   - Create API key
   - Add to `.env`:
     ```
     SMTP_HOST=smtp.sendgrid.net
     SMTP_PORT=587
     SMTP_USER=apikey
     SMTP_PASS=SG.xxx
     SMTP_FROM=noreply@lithiumbuy.com
     ```
3. **Option B - AWS SES:**
   - Setup in AWS Console
   - Verify email domain
   - Create SMTP credentials
   - Add to `.env`:
     ```
     SMTP_HOST=email-smtp.us-east-1.amazonaws.com
     SMTP_PORT=587
     SMTP_USER=xxx
     SMTP_PASS=xxx
     SMTP_FROM=noreply@lithiumbuy.com
     ```
4. Test email sending:
   ```javascript
   await emailService.send({
     to: 'test@example.com',
     subject: 'Test',
     text: 'Test email'
   });
   ```
5. Verify email delivery

**Success Criteria:**
- [ ] Email provider configured
- [ ] Domain verified
- [ ] Test email sent successfully
- [ ] Email delivered to inbox

**Files Modified:**
- `.env`
- `/server/services/emailService.ts`

**Blocker:** Domain verification may take a few hours

---

### Task 1.1.7: Update .env.example
**Owner:** Integration Lead
**Estimated:** 1 hour
**Status:** ⚪ TODO

**Steps:**
1. Open `.env.example`
2. Add all new environment variables with placeholder values
3. Add comments explaining each variable
4. Group by service (Database, Video, Payment, Email, etc.)
5. Mark required vs. optional variables
6. Document where to obtain each key

**Success Criteria:**
- [ ] All environment variables documented
- [ ] Clear comments for each variable
- [ ] Grouped logically
- [ ] Required vs. optional marked

**Files Modified:**
- `.env.example`

**Blocker:** None

---

### Task 1.1.8: Create .env.production Template
**Owner:** Integration Lead
**Estimated:** 1 hour
**Status:** ⚪ TODO

**Steps:**
1. Create `.env.production.example` file
2. Copy structure from `.env.example`
3. Add production-specific notes:
   - Use production API keys (not test)
   - Set NODE_ENV=production
   - Configure production database URL
   - Add production domain URLs
4. Add security checklist

**Success Criteria:**
- [ ] Production environment template created
- [ ] All variables listed
- [ ] Production notes added

**Files Created:**
- `.env.production.example`

**Blocker:** None

---

## WORKSTREAM 2: DATABASE ROW LEVEL SECURITY
**Owner:** Backend Lead
**Duration:** Days 3-7
**Priority:** P0 (BLOCKING)
**Complexity:** MEDIUM

### Task 1.2.1: Audit Current RLS Policies
**Owner:** Backend Lead
**Estimated:** 2 hours
**Status:** ⚪ TODO

**Steps:**
1. List all database tables (23 total)
2. Check which tables have RLS enabled:
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```
3. Review existing RLS policies:
   ```sql
   SELECT * FROM pg_policies;
   ```
4. Document gaps (tables without RLS)
5. Create spreadsheet tracking RLS coverage

**Success Criteria:**
- [ ] All tables inventoried
- [ ] Current RLS status documented
- [ ] Gap list created

**Deliverable:** RLS audit document

**Blocker:** None

---

### Task 1.2.2: User Profiles RLS
**Owner:** Backend Lead
**Estimated:** 3 hours
**Status:** ⚪ TODO

**SQL to implement:**
```sql
-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "user_profiles_insert_own" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all profiles
CREATE POLICY "user_profiles_select_admin" ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

**Success Criteria:**
- [ ] RLS enabled on user_profiles
- [ ] Users can only access own profile
- [ ] Admins can access all profiles
- [ ] Tests passing

**Files Created:**
- `/server/db/migrations/012_complete_rls_policies.sql`

**Blocker:** None

---

### Task 1.2.3: Quotes RLS
**Owner:** Backend Lead
**Estimated:** 4 hours
**Status:** ⚪ TODO

**RLS Rules:**
- Buyer (quote requestor) can view/edit their own quotes
- Supplier (quote receiver) can view quotes addressed to them
- Supplier can create quote responses
- Admins can view all quotes

**SQL Implementation:**
```sql
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own quotes
CREATE POLICY "quotes_select_buyer" ON quotes
  FOR SELECT
  USING (user_id = auth.uid());

-- Suppliers can view quotes for their products
CREATE POLICY "quotes_select_supplier" ON quotes
  FOR SELECT
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = auth.uid()
    )
  );

-- Admins can view all
CREATE POLICY "quotes_select_admin" ON quotes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can create quotes
CREATE POLICY "quotes_insert_user" ON quotes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own quotes
CREATE POLICY "quotes_update_own" ON quotes
  FOR UPDATE
  USING (user_id = auth.uid());
```

**Success Criteria:**
- [ ] Buyers see only their quotes
- [ ] Suppliers see quotes for their products
- [ ] No unauthorized access

**Blocker:** None

---

### Task 1.2.4: RFQs RLS
**Owner:** Backend Lead
**Estimated:** 5 hours
**Status:** ⚪ TODO

**RLS Rules:**
- Buyers can view/edit their own RFQs
- Suppliers can view published RFQs (not draft)
- Admins can view all RFQs
- Draft RFQs only visible to creator

**SQL Implementation:**
```sql
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own RFQs
CREATE POLICY "rfqs_select_buyer" ON rfqs
  FOR SELECT
  USING (buyer_id = auth.uid());

-- Suppliers can view published RFQs
CREATE POLICY "rfqs_select_supplier_published" ON rfqs
  FOR SELECT
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'supplier'
    )
  );

-- Buyers can create RFQs
CREATE POLICY "rfqs_insert_buyer" ON rfqs
  FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

-- Buyers can update their own RFQs
CREATE POLICY "rfqs_update_own" ON rfqs
  FOR UPDATE
  USING (buyer_id = auth.uid());
```

**Success Criteria:**
- [ ] Draft RFQs private to creator
- [ ] Published RFQs visible to suppliers
- [ ] Proper role-based access

**Blocker:** None

---

### Task 1.2.5: RFQ Responses RLS
**Owner:** Backend Lead
**Estimated:** 3 hours
**Status:** ⚪ TODO

**RLS Rules:**
- Supplier can view/edit their own responses
- RFQ creator (buyer) can view all responses to their RFQ
- Admins can view all responses

**SQL Implementation:**
```sql
ALTER TABLE rfq_responses ENABLE ROW LEVEL SECURITY;

-- Suppliers can view their own responses
CREATE POLICY "rfq_responses_select_own" ON rfq_responses
  FOR SELECT
  USING (supplier_id = auth.uid());

-- RFQ creators can view all responses to their RFQs
CREATE POLICY "rfq_responses_select_rfq_owner" ON rfq_responses
  FOR SELECT
  USING (
    rfq_id IN (
      SELECT id FROM rfqs WHERE buyer_id = auth.uid()
    )
  );

-- Suppliers can create responses
CREATE POLICY "rfq_responses_insert_supplier" ON rfq_responses
  FOR INSERT
  WITH CHECK (supplier_id = auth.uid());
```

**Success Criteria:**
- [ ] Suppliers see only their responses
- [ ] Buyers see all responses to their RFQs
- [ ] No cross-supplier visibility

**Blocker:** Depends on Task 1.2.4 (RFQs RLS)

---

### Task 1.2.6: Orders RLS
**Owner:** Backend Lead
**Estimated:** 4 hours
**Status:** ⚪ TODO

**RLS Rules:**
- Buyer can view their own orders
- Supplier can view orders from their quotes
- Admins can view all orders

**Implementation similar to quotes table**

**Success Criteria:**
- [ ] Buyers see only their orders
- [ ] Suppliers see only orders for their products
- [ ] Order privacy maintained

**Blocker:** None

---

### Task 1.2.7: Telebuy Sessions RLS
**Owner:** Backend Lead
**Estimated:** 3 hours
**Status:** ⚪ TODO

**RLS Rules:**
- Session participants can view/edit session
- Non-participants cannot access
- Admins can view all sessions

**SQL Implementation:**
```sql
ALTER TABLE telebuy_sessions ENABLE ROW LEVEL SECURITY;

-- Participants can view their sessions
CREATE POLICY "telebuy_sessions_select_participant" ON telebuy_sessions
  FOR SELECT
  USING (
    user_id = auth.uid() OR supplier_id = auth.uid()
  );

-- Users can create sessions
CREATE POLICY "telebuy_sessions_insert_user" ON telebuy_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Participants can update sessions
CREATE POLICY "telebuy_sessions_update_participant" ON telebuy_sessions
  FOR UPDATE
  USING (user_id = auth.uid() OR supplier_id = auth.uid());
```

**Success Criteria:**
- [ ] Only participants access sessions
- [ ] No unauthorized session access
- [ ] Admins have full access

**Blocker:** None

---

### Task 1.2.8: Reviews RLS
**Owner:** Backend Lead
**Estimated:** 2 hours
**Status:** ⚪ TODO

**RLS Rules:**
- Reviews are public (all users can read)
- Only review author can edit/delete
- Admins can moderate (delete)

**SQL Implementation:**
```sql
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews (public)
CREATE POLICY "reviews_select_all" ON reviews
  FOR SELECT
  USING (true);

-- Users can create reviews
CREATE POLICY "reviews_insert_user" ON reviews
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Authors can update their own reviews
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE
  USING (user_id = auth.uid());

-- Authors and admins can delete reviews
CREATE POLICY "reviews_delete_own_or_admin" ON reviews
  FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

**Success Criteria:**
- [ ] Reviews publicly viewable
- [ ] Only authors can edit
- [ ] Admins can moderate

**Blocker:** None

---

### Remaining RLS Tasks (1.2.9 - 1.2.12)

Tasks for: auctions, bids, escrow_accounts, suppliers (already done), contracts, tenders, etc.

**Total RLS Effort:** ~40 hours across 3-4 days with parallelization

---

## WORKSTREAM 3: CORE TEST SUITE
**Owner:** QA Lead
**Duration:** Days 3-10
**Priority:** P0 (BLOCKING)
**Complexity:** HIGH

### Test Infrastructure Setup (Day 3)

#### Task 1.3.1: Setup Test Database
**Estimated:** 3 hours
**Status:** ⚪ TODO

**Steps:**
1. Create new Supabase project for testing
2. Run all migrations on test database
3. Create `.env.test` with test database credentials
4. Configure Vitest to use test database
5. Write database cleanup utility for tests

**Success Criteria:**
- [ ] Test database created
- [ ] Migrations applied
- [ ] Vitest configured
- [ ] Cleanup utility working

---

#### Task 1.3.2: Create Test Data Factories
**Estimated:** 6 hours
**Status:** ⚪ TODO

**Factories to create:**
```typescript
// /server/__tests__/fixtures/factories.ts

export const createUser = (overrides?) => ({
  id: uuid(),
  email: `test-${Date.now()}@example.com`,
  role: 'buyer',
  ...overrides
});

export const createSupplier = (overrides?) => ({
  id: uuid(),
  name: `Test Supplier ${Date.now()}`,
  verification_tier: 'silver',
  rating: 4.5,
  ...overrides
});

export const createRFQ = (overrides?) => ({
  id: uuid(),
  buyer_id: uuid(),
  title: 'Test RFQ',
  status: 'draft',
  ...overrides
});

// ... factories for quotes, orders, auctions, etc.
```

**Success Criteria:**
- [ ] Factories for all 23 tables
- [ ] Realistic test data
- [ ] Easy to use in tests

---

### Integration Tests (Days 4-8)

#### Task 1.3.3: Auth Flow Tests
**Estimated:** 8 hours

Test scenarios:
- User signup with valid email/password
- User signup with invalid data (validation errors)
- User login with correct credentials
- User login with incorrect credentials
- Token refresh
- Logout
- Protected route access

**Files:**
- `/server/__tests__/integration/auth.test.ts`

---

#### Task 1.3.4: Supplier CRUD Tests
**Estimated:** 6 hours

Test scenarios:
- Create supplier
- List suppliers with pagination
- Filter suppliers by criteria
- Get supplier detail
- Update supplier profile
- Verify supplier (admin only)

**Files:**
- `/server/__tests__/integration/supplier.test.ts`

---

#### Task 1.3.5: RFQ Flow Tests
**Estimated:** 10 hours

Full lifecycle test:
1. Buyer creates RFQ (draft)
2. Buyer publishes RFQ
3. System matches suppliers
4. Suppliers receive notifications
5. Supplier submits response
6. Responses scored automatically
7. Buyer reviews responses
8. Buyer awards RFQ to supplier
9. Contract generated

**Files:**
- `/server/__tests__/integration/rfq-flow.test.ts`

---

#### Task 1.3.6: Quote Request Flow Tests
**Estimated:** 8 hours

Test scenarios:
- Buyer requests quote from supplier
- Supplier receives quote request
- Supplier submits quote
- Buyer accepts quote
- Order created from accepted quote

**Files:**
- `/server/__tests__/integration/quote-flow.test.ts`

---

#### Task 1.3.7: Auction Flow Tests
**Estimated:** 10 hours

Test scenarios:
- Create auction (English, Dutch, Sealed)
- Start auction
- Place bids
- Bid validation (minimum increment)
- Retract bid
- End auction
- Winner determination
- Escrow funding

**Files:**
- `/server/__tests__/integration/auction-flow.test.ts`

---

#### Task 1.3.8: Payment Processing Tests
**Estimated:** 8 hours

Test with Stripe test mode:
- Create payment intent
- Fund escrow account
- Webhook handling (payment succeeded)
- Release escrow to supplier
- Refund processing
- Failed payment handling

**Files:**
- `/server/__tests__/integration/payment-flow.test.ts`

**Blocker:** Requires Stripe test keys (Task 1.1.2)

---

#### Task 1.3.9: Video Call Tests
**Estimated:** 6 hours

Test scenarios:
- Schedule video call
- Create Daily.co room
- Generate meeting tokens
- Start call
- End call
- Recording storage

**Files:**
- `/server/__tests__/integration/video-flow.test.ts`

**Blocker:** Requires Daily.co test keys (Task 1.1.1)

---

#### Task 1.3.10: Email Notification Tests
**Estimated:** 4 hours

Test scenarios (with mock SMTP):
- RFQ published notification
- Quote received notification
- Order confirmation
- Welcome email

**Files:**
- `/server/__tests__/integration/email.test.ts`

---

### Unit Tests (Days 6-9)

#### Task 1.3.13: Service Unit Tests
**Estimated:** 12 hours

Test individual service methods:
- `rfqService.matchSuppliers()`
- `auctionService.determinewinner()`
- `escrowService.fundAccount()`
- etc.

**Files:**
- `/server/__tests__/unit/services/*.test.ts`

---

#### Task 1.3.14: Component Tests
**Estimated:** 10 hours

Test React components:
- `RFQForm.tsx` - form submission, validation
- `AuctionCard.tsx` - bid submission
- `FilterSidebar.tsx` - filter state
- `SupplierCard.tsx` - rendering

**Files:**
- `/client/src/components/__tests__/*.test.tsx`

---

### Task 1.3.15: API Endpoint Tests
**Estimated:** 14 hours

Test all 12 route modules:
- Request validation (Zod schemas)
- Success responses
- Error responses (404, 400, 401, 403, 500)
- Pagination
- Filtering
- Authentication required

**Files:**
- `/server/__tests__/api/*.test.ts`

---

## WORKSTREAM 4: CI/CD PIPELINE
**Owner:** QA Lead + Integration Lead
**Duration:** Days 8-10
**Priority:** P0
**Complexity:** MEDIUM

### Task 1.4.1: GitHub Actions Workflow
**Estimated:** 3 hours
**Status:** ⚪ TODO

**File:** `/.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main, claude/*]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run db:push
        env:
          SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_KEY }}

      - name: Run tests
        run: npm test -- --coverage
        env:
          NODE_ENV: test

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
```

**Success Criteria:**
- [ ] Workflow created
- [ ] Tests run on PR
- [ ] Lint checks enforced
- [ ] Build verification

---

### Remaining CI/CD Tasks

- 1.4.2: Configure test job
- 1.4.3: Configure lint job
- 1.4.4: Configure build job
- 1.4.5: Preview deployments (Netlify)
- 1.4.6: Environment secrets
- 1.4.7: PR status checks
- 1.4.8: Code coverage reporting
- 1.4.9: Staging deployment
- 1.4.10: E2E pipeline test

**Total CI/CD Effort:** ~30 hours across 3 days

---

## DAILY EXECUTION SCHEDULE

### Day 1 (Dec 10): API Keys Kickoff
- **AM:** Tasks 1.1.1, 1.1.2 (Daily.co, Stripe)
- **PM:** Tasks 1.1.4, 1.1.5 (Gemini, Perplexity)
- **EOD:** 4/8 API keys completed

### Day 2 (Dec 11): API Keys + RLS Start
- **AM:** Tasks 1.1.3, 1.1.6 (DocuSign, SMTP)
- **PM:** Tasks 1.1.7, 1.1.8, 1.2.1 (Env docs, RLS audit)
- **EOD:** All API keys done, RLS planning complete

### Day 3 (Dec 12): RLS Implementation + Test Setup
- **AM:** Tasks 1.2.2, 1.2.3 (User profiles, Quotes RLS)
- **PM:** Tasks 1.3.1, 1.3.2 (Test DB, Test factories)
- **EOD:** 2 RLS policies done, test infra ready

### Day 4 (Dec 13): RLS Continued + Integration Tests
- **AM:** Tasks 1.2.4, 1.2.5 (RFQs, RFQ responses RLS)
- **PM:** Tasks 1.3.3, 1.3.4 (Auth tests, Supplier tests)
- **EOD:** 4 RLS policies done, 2 test suites done

### Day 5 (Dec 14): RLS Final + More Tests
- **AM:** Tasks 1.2.6, 1.2.7, 1.2.8 (Orders, Telebuy, Reviews RLS)
- **PM:** Task 1.3.5 (RFQ flow tests - critical)
- **EOD:** 7 RLS policies done, RFQ testing complete

### Day 6 (Dec 15): Remaining RLS + Tests
- **AM:** Tasks 1.2.9, 1.2.10, 1.2.11 (Auctions, Bids RLS, Testing)
- **PM:** Tasks 1.3.6, 1.3.7 (Quote flow, Auction flow tests)
- **EOD:** ALL RLS complete, 5 integration test suites done

### Day 7 (Dec 16): Integration Tests Continued
- **AM:** Tasks 1.3.8, 1.3.9 (Payment tests, Video tests)
- **PM:** Tasks 1.3.10, 1.3.11 (Email tests, Review tests)
- **EOD:** All integration tests complete

### Day 8 (Dec 17): Unit Tests + CI/CD Start
- **AM:** Task 1.3.13 (Service unit tests)
- **PM:** Tasks 1.4.1, 1.4.2, 1.4.3 (GitHub Actions workflow)
- **EOD:** Unit tests in progress, CI workflow created

### Day 9 (Dec 18): Component Tests + CI/CD
- **AM:** Task 1.3.14 (Component tests)
- **PM:** Tasks 1.4.4, 1.4.5 (Build job, Preview deployments)
- **EOD:** Frontend tests done, CI almost complete

### Day 10 (Dec 19): API Tests + CI/CD Final
- **AM:** Task 1.3.15 (API endpoint tests)
- **PM:** Tasks 1.4.6, 1.4.7, 1.4.8 (Secrets, status checks, coverage)
- **EOD:** All tests complete, CI fully operational

### Days 11-12 (Dec 20-21): Buffer + Documentation
- Fix failing tests
- Improve test coverage where needed
- Document all changes
- Task 1.4.9, 1.4.10 (Staging deployment, E2E test)

### Days 13-14 (Dec 22-23): Phase 1 Review + Handoff
- Review all Phase 1 deliverables
- Conduct Phase 1 Go/No-Go review
- Prepare Phase 2 kickoff
- Update all documentation

---

## BLOCKER MANAGEMENT

### Known Blockers

**BLOCKER-001: API Vendor Account Approval**
- **Tasks Affected:** 1.1.1, 1.1.2, 1.1.3, 1.1.6
- **Mitigation:** Start signups on Day 1, use test mode where possible
- **Contingency:** Mock integrations for testing if delays occur

**BLOCKER-002: Test Coverage Target**
- **Tasks Affected:** 1.3.3 - 1.3.15
- **Mitigation:** Prioritize critical path tests first
- **Contingency:** Accept 50% coverage minimum if time constrained

---

## SUCCESS METRICS TRACKING

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| API Integrations Complete | 6/6 | 0/6 | 🔴 Not Started |
| RLS Policies Implemented | 23/23 | 1/23 | 🟡 Suppliers Done |
| Test Coverage | ≥60% | ~10% | 🔴 Below Target |
| CI/CD Pipeline | Operational | None | 🔴 Not Started |
| P0 Bugs | 0 | TBD | ⚪ Unknown |
| P1 Bugs | <5 | TBD | ⚪ Unknown |

---

## QUICK WINS (Can Execute Now)

### Quick Win 1: Update .env.example (30 min)
Low-hanging fruit that doesn't block anything

### Quick Win 2: Create Test Factories (2 hours)
Can start immediately, unblocks all testing

### Quick Win 3: RLS Audit (2 hours)
Understand the scope before diving in

---

**END OF PHASE 1 TASK BREAKDOWN**
*Update this document daily with task completion status*
