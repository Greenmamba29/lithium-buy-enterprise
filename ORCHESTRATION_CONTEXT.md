# LITHIUMBUY ORCHESTRATION CONTEXT
**Single Source of Truth for All Agents**
**Last Updated:** 2025-12-10
**Session ID:** claude/build-execution-agent-01DWPQkYWEoLgaxKvAPt3LCY

---

## EXECUTIVE SUMMARY

**Project:** LithiumBuy.com - B2B Commodity Marketplace Middleman Platform
**Current State:** 70% complete (~28K lines of TypeScript)
**Target:** Production-ready MVP in 6 weeks, full platform in 12 weeks
**Status:** ⚡ ACTIVE EXECUTION - Phase 1 in progress

### Key Metrics
- **Codebase:** 212 TypeScript files, 27,839 lines of code
- **Backend:** Express + Supabase PostgreSQL (23 tables, 12 route modules, 25+ services)
- **Frontend:** React 19 + shadcn/ui (13 pages, 25+ components, 12 custom hooks)
- **Test Coverage:** ~10% (CRITICAL GAP)
- **Integrations:** 5 external APIs (partially implemented, need production keys)

---

## PROJECT VISION & SUCCESS CRITERIA

### Vision Statement
Build the **fastest, smartest, most trusted** B2B lithium marketplace that combines:
- Real-time market intelligence (Bloomberg, Reuters, S&P, Fastmarkets data)
- LLM-driven deal acceleration (automated RFQ matching, contract generation)
- Trust verification layers (supplier verification, escrow payments, e-signatures)
- Live negotiation tools (video calls, auctions, procurement platform)

### Success Criteria

**Phase 1 (Weeks 1-2): Setup & Foundation**
- ✅ All API integrations connected with production keys
- ✅ Database RLS policies completed for all tables
- ✅ Core test coverage ≥60% for critical flows
- ✅ CI/CD pipeline deployed and green

**Phase 2 (Weeks 3-4): MVP Core**
- ✅ End-to-end RFQ flow (create → publish → respond → award)
- ✅ Live auction marketplace with real-time bidding
- ✅ Video call integration (Daily.co) fully functional
- ✅ Payment processing (Stripe escrow) operational
- ✅ Real market data feeds from 2+ providers

**Phase 3 (Weeks 5-8): Advanced Features**
- ✅ LLM-driven supplier matching (≥85% accuracy)
- ✅ Automated contract generation (DocuSign integration)
- ✅ Price intelligence dashboard with arbitrage alerts
- ✅ Advanced analytics for buyers and suppliers
- ✅ Performance optimization (sub-500ms API response times)

**Phase 4 (Weeks 9-12): Production Launch**
- ✅ Load testing (500+ concurrent users)
- ✅ Security audit passed
- ✅ Comprehensive documentation
- ✅ Production deployment with monitoring
- ✅ Onboarding flow for first 10 suppliers

---

## TECH STACK & ARCHITECTURE

### Frontend
```
React 19.2 + TypeScript 5.6
├── Build: Vite 5.4
├── Routing: Wouter 3.3.5
├── State: TanStack Query v5
├── UI: shadcn/ui + Tailwind CSS 3.4
├── Forms: React Hook Form + Zod
├── Charts: Recharts 2.15
└── Theme: Next-themes (dark/light)
```

### Backend
```
Express 4.21.2 + TypeScript
├── Database: Supabase PostgreSQL 17.4.1
├── Auth: Supabase Auth (JWT)
├── ORM: Drizzle ORM 0.39 (legacy)
├── Validation: Zod 3.24
├── Security: Helmet + CORS + Rate Limiting
├── Logging: Pino 8.17.2
├── Error Tracking: Sentry 8.0
├── Jobs: BullMQ 5.4.0
└── Session: express-session + PostgreSQL
```

### External Services Strategy

| Service | Purpose | Status | Priority |
|---------|---------|--------|----------|
| **Supabase** | Database, Auth, Realtime | ✅ Connected | P0 |
| **Daily.co** | Video conferencing | ⚙️ Placeholder | P0 |
| **Stripe** | Payment processing | ⚙️ SDK installed | P0 |
| **DocuSign** | e-Signature | ⚙️ OAuth skeleton | P1 |
| **Gemini 2.5** | AI image processing | ⚙️ Needs key | P1 |
| **Perplexity** | Market intelligence | ⚙️ Service skeleton | P1 |
| **Nodemailer** | Email service | ⚙️ Needs SMTP | P1 |
| **Bloomberg** | Market data feed | ❌ Not started | P2 |
| **Reuters** | Market data feed | ❌ Not started | P2 |
| **S&P Global** | Market data feed | ❌ Not started | P2 |
| **Fastmarkets** | Lithium price data | ❌ Not started | P2 |

---

## DECISION LOG

### Architectural Decisions

**AD-001: Database - Supabase PostgreSQL**
- **Date:** 2025-12-10
- **Decision:** Use Supabase for database, auth, and real-time features
- **Rationale:** Managed PostgreSQL with built-in auth, RLS policies, and real-time subscriptions
- **Status:** ✅ Implemented
- **Impact:** HIGH - Foundation for all data operations

**AD-002: Frontend Framework - React 19**
- **Date:** 2025-12-10
- **Decision:** React 19 with Vite build tool
- **Rationale:** Latest React features, excellent TypeScript support, fast HMR
- **Status:** ✅ Implemented
- **Impact:** HIGH - Core UI framework

**AD-003: API Architecture - RESTful Express**
- **Date:** 2025-12-10
- **Decision:** Express.js REST API (not GraphQL)
- **Rationale:** Simpler for team, excellent middleware ecosystem, easier to cache
- **Status:** ✅ Implemented
- **Impact:** HIGH - All backend communication

**AD-004: Real-time - WebSocket + Supabase Realtime**
- **Date:** 2025-12-10
- **Decision:** Hybrid WebSocket (custom) + Supabase Realtime subscriptions
- **Rationale:** WebSocket for auctions/bidding, Supabase for database changes
- **Status:** ⚙️ Partial - WebSocket skeleton exists
- **Impact:** MEDIUM - Live auction features

**AD-005: State Management - TanStack Query**
- **Date:** 2025-12-10
- **Decision:** TanStack Query for server state, React hooks for local state
- **Rationale:** Best-in-class caching, background fetching, request deduplication
- **Status:** ✅ Implemented
- **Impact:** MEDIUM - Data fetching patterns

**AD-006: Video Platform - Daily.co**
- **Date:** 2025-12-10
- **Decision:** Daily.co for video conferencing
- **Rationale:** Simple API, embeddable rooms, recording/transcription built-in
- **Status:** ⚙️ Placeholder - Needs API key
- **Impact:** HIGH - TELEBUY feature depends on this

**AD-007: Payment Processing - Stripe**
- **Date:** 2025-12-10
- **Decision:** Stripe for escrow payments and transaction processing
- **Rationale:** Industry standard, excellent API, built-in compliance
- **Status:** ⚙️ SDK installed - Integration pending
- **Impact:** HIGH - Revenue critical

**AD-008: Contract Signing - DocuSign**
- **Date:** 2025-12-10
- **Decision:** DocuSign for e-signature workflows
- **Rationale:** Market leader, legal compliance, audit trail
- **Status:** ⚙️ OAuth skeleton - Needs credentials
- **Impact:** MEDIUM - Procurement automation

**AD-009: Market Intelligence - Perplexity Labs**
- **Date:** 2025-12-10
- **Decision:** Start with Perplexity API for market research
- **Rationale:** Fast implementation, good for MVP, can add Bloomberg/Reuters later
- **Status:** ⚙️ Service skeleton - Needs API key
- **Impact:** MEDIUM - Market intelligence features

**AD-010: Job Queue - BullMQ**
- **Date:** 2025-12-10
- **Decision:** BullMQ for background job processing
- **Rationale:** Redis-backed, excellent performance, good monitoring
- **Status:** ⚙️ Installed but not used
- **Impact:** MEDIUM - Email, post-call automation, reports

---

## SUB-AGENT ORCHESTRATION

### Communication Protocol

**Agent Handoff Format:**
```markdown
### HANDOFF TO [AGENT_NAME]
**From:** [Current Agent]
**Priority:** P0/P1/P2
**Blocking:** Yes/No
**Dependencies:** [List prerequisite tasks]

**Task:**
[Clear task description]

**Context:**
- [Relevant file paths]
- [Database tables involved]
- [API endpoints affected]

**Success Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Output Expected:**
[What should be delivered]

**Timeline:** [Hours/Days]
```

### Agent Registry

#### 1. Backend Lead Agent
**Charter:** Own all server-side code, API routes, services, database migrations
**Responsibilities:**
- API endpoint implementation and maintenance
- Service layer business logic
- Database schema design and migrations
- Authentication and authorization
- Background job processing
- Performance optimization

**Key Files:**
- `/server/routes/*.ts` - API routes
- `/server/services/*.ts` - Business logic
- `/server/middleware/*.ts` - Cross-cutting concerns
- `/server/db/migrations/*.sql` - Database migrations

**Success Metrics:**
- API response time <500ms (p95)
- Test coverage ≥70% for services
- Zero security vulnerabilities
- All endpoints documented in `/docs/API.md`

---

#### 2. Frontend Lead Agent
**Charter:** Own all client-side code, UI components, pages, hooks
**Responsibilities:**
- React component development
- Page implementations
- Custom hooks for data fetching
- UI/UX consistency
- Responsive design
- Performance optimization (bundle size, load time)

**Key Files:**
- `/client/src/pages/*.tsx` - Page components
- `/client/src/components/*.tsx` - Reusable components
- `/client/src/hooks/*.ts` - Custom hooks
- `/client/src/lib/*.ts` - Utilities

**Success Metrics:**
- Bundle size <600KB gzipped
- Lighthouse score ≥90
- Zero console errors
- All components accessible (WCAG 2.1 AA)

---

#### 3. LLM/Prompt Engineering Agent
**Charter:** Own all AI/ML features, prompt engineering, model integration
**Responsibilities:**
- Supplier matching algorithm (RFQ → Supplier scoring)
- Contract generation prompts
- Market intelligence synthesis
- Image processing workflows (Gemini)
- Content generation (blog posts, reports)
- Perplexity API integration for research

**Key Files:**
- `/server/services/perplexityService.ts` - Market intelligence
- `/server/services/geminiService.ts` - AI image processing
- `/server/services/rfqService.ts` - Supplier matching logic
- `/server/services/procurementService.ts` - Contract generation
- `/server/services/contentGenerationService.ts` - AI content

**Success Metrics:**
- Supplier matching accuracy ≥85%
- Contract generation success rate ≥90%
- API response time <3s for AI operations
- Cost per request <$0.10

---

#### 4. Data Pipeline Lead Agent
**Charter:** Own all data integrations, ETL, market data feeds
**Responsibilities:**
- Bloomberg API integration
- Reuters data feed
- S&P Global data pipeline
- Fastmarkets lithium prices
- Data normalization and storage
- Cache strategy
- Real-time data streaming

**Key Files:**
- `/server/services/marketDataService.ts` - Market data aggregation
- `/server/services/cacheService.ts` - Caching layer
- `/server/services/websocketService.ts` - Real-time updates
- `/server/db/migrations/*_market_intelligence.sql` - Market data tables

**Success Metrics:**
- Data freshness <5 minutes
- API uptime ≥99.5%
- Cache hit rate ≥80%
- Zero data quality issues

---

#### 5. Integration Lead Agent
**Charter:** Own all third-party integrations and API orchestration
**Responsibilities:**
- Daily.co video integration
- DocuSign e-signature workflow
- Stripe payment processing
- Email service (Nodemailer/SMTP)
- Calendar integrations
- Error handling and retries
- Circuit breakers for external APIs

**Key Files:**
- `/server/services/videoService.ts` - Daily.co integration
- `/server/services/docuSignService.ts` - e-Signature
- `/server/services/escrowService.ts` - Stripe payments
- `/server/services/emailService.ts` - Email notifications
- `/server/utils/circuitBreaker.ts` - Circuit breaker pattern
- `/server/utils/retry.ts` - Retry logic

**Success Metrics:**
- External API success rate ≥99%
- Circuit breaker triggers <5/day
- Retry success rate ≥95%
- All integrations documented

---

#### 6. QA/Testing Lead Agent
**Charter:** Own all testing infrastructure, test coverage, quality assurance
**Responsibilities:**
- Unit test development
- Integration test suites
- E2E testing
- Performance testing
- Security testing
- CI/CD pipeline maintenance
- Test documentation

**Key Files:**
- `/server/__tests__/**/*.test.ts` - Backend tests
- `/client/src/**/__tests__/*.test.tsx` - Frontend tests
- `/vitest.config.ts` - Test configuration
- `/.github/workflows/*.yml` - CI/CD pipelines

**Success Metrics:**
- Test coverage ≥70% overall
- Critical path coverage 100%
- All tests passing (green CI)
- Test execution time <5 minutes

---

### Agent Communication Matrix

| From/To | Backend | Frontend | LLM | Data | Integration | QA |
|---------|---------|----------|-----|------|-------------|-----|
| **Backend** | - | API contracts | Prompt context | Data schemas | Integration specs | Test fixtures |
| **Frontend** | API requests | - | UI for AI features | Data display | User flows | UI test cases |
| **LLM** | Scoring logic | AI responses | - | Training data | Model APIs | AI test data |
| **Data** | Data models | Data formats | Market context | - | Feed configs | Data validation |
| **Integration** | Service contracts | Loading states | API limits | Data sources | - | Integration tests |
| **QA** | Test reports | UI bugs | AI accuracy | Data quality | Integration status | - |

---

## DELIVERABLES TRACKER

### Phase 1: Setup & Foundation (Weeks 1-2)

| Deliverable | Owner | Status | Blocker | ETA |
|-------------|-------|--------|---------|-----|
| **1.1 API Keys Configuration** | Integration | 🟡 In Progress | Need credentials | 2025-12-12 |
| 1.1.1 Daily.co API key setup | Integration | ⚪ Pending | - | 2025-12-11 |
| 1.1.2 Stripe API keys (test + prod) | Integration | ⚪ Pending | - | 2025-12-11 |
| 1.1.3 DocuSign OAuth credentials | Integration | ⚪ Pending | - | 2025-12-12 |
| 1.1.4 Gemini API key | Integration | ⚪ Pending | - | 2025-12-11 |
| 1.1.5 Perplexity API key | Data | ⚪ Pending | - | 2025-12-11 |
| 1.1.6 SMTP credentials (email) | Integration | ⚪ Pending | - | 2025-12-11 |
| **1.2 Database RLS Policies** | Backend | ⚪ Pending | - | 2025-12-13 |
| 1.2.1 User profiles RLS | Backend | ⚪ Pending | - | 2025-12-12 |
| 1.2.2 Quotes RLS | Backend | ⚪ Pending | - | 2025-12-12 |
| 1.2.3 RFQs RLS | Backend | ⚪ Pending | - | 2025-12-13 |
| 1.2.4 Orders RLS | Backend | ⚪ Pending | - | 2025-12-13 |
| 1.2.5 Telebuy sessions RLS | Backend | ⚪ Pending | - | 2025-12-13 |
| **1.3 Core Test Suite** | QA | ⚪ Pending | - | 2025-12-14 |
| 1.3.1 RFQ flow integration tests | QA | ⚪ Pending | - | 2025-12-13 |
| 1.3.2 Auction bidding tests | QA | ⚪ Pending | - | 2025-12-13 |
| 1.3.3 Payment processing tests | QA | ⚪ Pending | Stripe setup | 2025-12-14 |
| 1.3.4 Video call integration tests | QA | ⚪ Pending | Daily.co setup | 2025-12-14 |
| 1.3.5 Auth flow tests | QA | ⚪ Pending | - | 2025-12-12 |
| **1.4 CI/CD Pipeline** | QA | ⚪ Pending | - | 2025-12-14 |
| 1.4.1 GitHub Actions workflow | QA | ⚪ Pending | - | 2025-12-13 |
| 1.4.2 Automated testing on PR | QA | ⚪ Pending | - | 2025-12-14 |
| 1.4.3 Preview deployments | QA | ⚪ Pending | - | 2025-12-14 |

### Phase 2: MVP Core (Weeks 3-4)

| Deliverable | Owner | Status | Blocker | ETA |
|-------------|-------|--------|---------|-----|
| **2.1 End-to-End RFQ Flow** | Backend + Frontend | ⚪ Pending | Phase 1 complete | 2025-12-21 |
| **2.2 Live Auction Marketplace** | Backend + Frontend | ⚪ Pending | WebSocket impl | 2025-12-21 |
| **2.3 Video Call Integration** | Integration | ⚪ Pending | Daily.co keys | 2025-12-18 |
| **2.4 Payment Processing** | Integration | ⚪ Pending | Stripe keys | 2025-12-20 |
| **2.5 Market Data Feeds** | Data | ⚪ Pending | API partnerships | 2025-12-23 |

### Phase 3: Advanced Features (Weeks 5-8)

| Deliverable | Owner | Status | Blocker | ETA |
|-------------|-------|--------|---------|-----|
| **3.1 LLM Supplier Matching** | LLM | ⚪ Pending | Phase 2 data | 2026-01-03 |
| **3.2 Contract Generation** | LLM + Integration | ⚪ Pending | DocuSign setup | 2026-01-06 |
| **3.3 Price Intelligence** | Data + LLM | ⚪ Pending | Market data | 2026-01-10 |
| **3.4 Analytics Dashboard** | Frontend + Backend | ⚪ Pending | Data collection | 2026-01-08 |
| **3.5 Performance Optimization** | All | ⚪ Pending | Load testing | 2026-01-10 |

### Phase 4: Production Launch (Weeks 9-12)

| Deliverable | Owner | Status | Blocker | ETA |
|-------------|-------|--------|---------|-----|
| **4.1 Load Testing** | QA | ⚪ Pending | Phase 3 complete | 2026-01-17 |
| **4.2 Security Audit** | Backend + QA | ⚪ Pending | All features done | 2026-01-20 |
| **4.3 Documentation** | All | ⚪ Pending | Final features | 2026-01-24 |
| **4.4 Production Deployment** | Integration | ⚪ Pending | All tests pass | 2026-01-27 |
| **4.5 Supplier Onboarding** | Frontend + Backend | ⚪ Pending | Deployment done | 2026-01-31 |

---

## BLOCKER TRACKING

### Active Blockers

**BLOCKER-001: Missing API Credentials**
- **Status:** 🔴 CRITICAL
- **Impact:** Blocks Phase 1 completion
- **Affected Tasks:** 1.1.1 - 1.1.6
- **Owner:** Integration Lead
- **Action Required:** Obtain production API keys for all services
- **Mitigation:** Use mock/test credentials for development
- **Target Resolution:** 2025-12-12

**BLOCKER-002: Test Coverage Below Threshold**
- **Status:** 🟡 HIGH
- **Impact:** Risk to production readiness
- **Affected Tasks:** All testing deliverables
- **Owner:** QA Lead
- **Action Required:** Write comprehensive test suites
- **Mitigation:** Manual testing for MVP
- **Target Resolution:** 2025-12-14

**BLOCKER-003: WebSocket Implementation Incomplete**
- **Status:** 🟡 MEDIUM
- **Impact:** Real-time auction features delayed
- **Affected Tasks:** 2.2 Live Auction Marketplace
- **Owner:** Backend Lead
- **Action Required:** Complete WebSocket service and client integration
- **Mitigation:** Use polling for MVP (performance hit)
- **Target Resolution:** 2025-12-18

---

## DEPENDENCY GRAPH

```
Phase 1 (Setup & Foundation)
├── 1.1 API Keys → Enables all integrations
│   ├── 1.1.1 Daily.co → 2.3 Video Calls
│   ├── 1.1.2 Stripe → 2.4 Payments
│   ├── 1.1.3 DocuSign → 3.2 Contract Gen
│   ├── 1.1.4 Gemini → AI Studio features
│   ├── 1.1.5 Perplexity → 2.5 Market Data
│   └── 1.1.6 SMTP → Email notifications
│
├── 1.2 Database RLS → Security for production
│   └── Enables Phase 2 end-to-end flows
│
├── 1.3 Core Tests → Quality assurance
│   └── Enables Phase 4 production launch
│
└── 1.4 CI/CD Pipeline → Automated deployments
    └── Enables rapid iteration

Phase 2 (MVP Core)
├── 2.1 RFQ Flow → Foundation for automation
│   └── Enables 3.1 LLM Matching
│
├── 2.2 Live Auctions → Revenue generation
│   └── Requires BLOCKER-003 resolution
│
├── 2.3 Video Calls → Engagement driver
│   └── Requires 1.1.1 Daily.co keys
│
├── 2.4 Payments → Revenue processing
│   └── Requires 1.1.2 Stripe keys
│
└── 2.5 Market Data → Intelligence layer
    └── Enables 3.3 Price Intelligence

Phase 3 (Advanced Features)
├── 3.1 LLM Matching → Competitive advantage
│   └── Requires 2.1 RFQ data
│
├── 3.2 Contract Gen → Automation win
│   └── Requires 1.1.3 DocuSign + 2.1 RFQ
│
├── 3.3 Price Intelligence → Value add
│   └── Requires 2.5 Market Data
│
├── 3.4 Analytics → Business insights
│   └── Requires all Phase 2 data
│
└── 3.5 Performance → Scale readiness
    └── Requires all features complete

Phase 4 (Production Launch)
└── All deliverables sequential
    └── Each depends on previous completion
```

---

## PROGRESS TRACKING

### Overall Progress: 70% → 100%

**Completed (70%):**
- ✅ Frontend architecture and components
- ✅ Backend API structure and routes
- ✅ Database schema (23 tables)
- ✅ Authentication and authorization
- ✅ Core business logic services
- ✅ UI/UX design system
- ✅ Documentation foundation

**In Progress (15%):**
- 🟡 API integrations (placeholder → production)
- 🟡 Testing infrastructure (10% → 70%)
- 🟡 Database RLS policies (partial)
- 🟡 WebSocket real-time features

**Not Started (15%):**
- ⚪ Production market data feeds
- ⚪ LLM-driven automation
- ⚪ Advanced analytics
- ⚪ Performance optimization
- ⚪ Load testing
- ⚪ Security audit

### Velocity Tracking

**Week 1 Target:** Complete Phase 1 (1.1 - 1.4)
**Week 2 Target:** Start Phase 2 (2.1 - 2.3)
**Week 3-4 Target:** Complete Phase 2 (2.4 - 2.5)
**Week 5-8 Target:** Complete Phase 3 (3.1 - 3.5)
**Week 9-12 Target:** Complete Phase 4 (4.1 - 4.5)

---

## RISK REGISTER

| Risk ID | Description | Probability | Impact | Mitigation | Owner |
|---------|-------------|-------------|--------|------------|-------|
| **R-001** | API vendor rate limits exceed capacity | Medium | High | Implement caching, circuit breakers | Data Lead |
| **R-002** | Stripe payment disputes during beta | Medium | High | Comprehensive logging, test mode first | Integration |
| **R-003** | Daily.co video quality issues | Low | Medium | Fallback to alternate provider (Whereby) | Integration |
| **R-004** | Database performance degradation | Medium | High | Implement caching, query optimization | Backend |
| **R-005** | Security vulnerability discovered | Low | Critical | Security audit before launch | QA + Backend |
| **R-006** | LLM supplier matching accuracy <85% | Medium | Medium | Manual override, continuous tuning | LLM |
| **R-007** | Test coverage target not met | High | High | Dedicated testing sprint | QA |
| **R-008** | Market data API costs exceed budget | Medium | Medium | Negotiate volume pricing, cache aggressively | Data |

---

## NOTES & LEARNINGS

### Key Insights
1. **Codebase Quality:** Existing code is well-architected with good separation of concerns
2. **Integration Readiness:** Service skeletons exist for all major integrations - just need keys
3. **Testing Gap:** Biggest risk is low test coverage - must prioritize in Phase 1
4. **Performance:** No major performance issues identified, but optimization needed for scale
5. **Security:** Good foundation with Helmet, CORS, JWT - need to complete RLS policies

### Team Assumptions
- Full-stack engineers available and familiar with TypeScript/React
- LLM specialist for prompt engineering and model integration
- Data engineer for market data pipelines and ETL
- DevOps/integration specialist for third-party APIs
- QA engineer for comprehensive test coverage

### Open Questions
1. Which market data provider should we prioritize first?
2. Should we use Perplexity or direct Bloomberg API for market intelligence?
3. What's the budget for API costs (esp. LLM and market data)?
4. Do we need multi-tenancy or single-tenant architecture?
5. What's the go-to-market strategy (launch date, marketing)?

---

## CONTACT & ESCALATION

**Project Lead:** Chief Execution Agent (this session)
**Session ID:** claude/build-execution-agent-01DWPQkYWEoLgaxKvAPt3LCY
**Git Branch:** claude/build-execution-agent-01DWPQkYWEoLgaxKvAPt3LCY

**Escalation Path:**
1. Agent reports blocker in context file
2. Chief Execution Agent reviews and attempts mitigation
3. If unresolved within 24 hours → escalate to human stakeholder
4. Critical blockers escalate immediately

---

**END OF CONTEXT FILE**
*This file should be updated daily by all agents*
