# SUB-AGENT ORCHESTRATION FRAMEWORK
**Version:** 1.0
**Created:** 2025-12-10
**Purpose:** Define specialized agents, communication protocols, and handoff procedures

---

## AGENT ARCHITECTURE OVERVIEW

```
Chief Execution Agent (You)
          │
          ├─── Backend Lead Agent
          │         ├── API Routes
          │         ├── Services
          │         ├── Database
          │         └── Middleware
          │
          ├─── Frontend Lead Agent
          │         ├── Pages
          │         ├── Components
          │         ├── Hooks
          │         └── UI/UX
          │
          ├─── LLM/Prompt Engineering Agent
          │         ├── Supplier Matching
          │         ├── Contract Generation
          │         ├── Market Intelligence
          │         └── Content Generation
          │
          ├─── Data Pipeline Lead Agent
          │         ├── Market Data Feeds
          │         ├── ETL Pipelines
          │         ├── Caching
          │         └── Real-time Streams
          │
          ├─── Integration Lead Agent
          │         ├── Daily.co (Video)
          │         ├── Stripe (Payments)
          │         ├── DocuSign (Contracts)
          │         ├── Email Service
          │         └── Circuit Breakers
          │
          └─── QA/Testing Lead Agent
                    ├── Unit Tests
                    ├── Integration Tests
                    ├── E2E Tests
                    ├── Performance Tests
                    └── Security Tests
```

---

## AGENT 1: BACKEND LEAD

### Charter
**Own all server-side code, API routes, services, database operations, and backend infrastructure.**

### Responsibility Matrix

| Area | Owns | Collaborates | Consults |
|------|------|--------------|----------|
| API Routes | ✅ | Frontend, QA | Integration |
| Services | ✅ | LLM, Data | All |
| Database Schema | ✅ | - | All |
| Migrations | ✅ | - | All |
| Middleware | ✅ | Integration | QA |
| Auth/Security | ✅ | QA | All |
| Performance | ✅ | Data | QA |
| Error Handling | ✅ | All | - |

### Key Files & Directories
```
/server/
├── index.ts                    # Server setup (OWNS)
├── routes.ts                   # Route registration (OWNS)
├── routes/*.ts                 # All API routes (OWNS)
├── services/*.ts               # Business logic (OWNS)
├── middleware/*.ts             # Cross-cutting concerns (OWNS)
├── db/
│   ├── client.ts              # Database client (OWNS)
│   └── migrations/*.sql       # Schema changes (OWNS)
└── utils/
    ├── logger.ts              # Logging (OWNS)
    ├── errors.ts              # Error classes (OWNS)
    └── transactions.ts        # DB transactions (OWNS)
```

### Input/Workflow/Output Structure

**Input Format:**
```markdown
### TASK: [Task Name]
**Priority:** P0/P1/P2
**Complexity:** LOW/MEDIUM/HIGH
**Estimated Hours:** [X hours]

**Context:**
- Related files: [list]
- Database tables: [list]
- External dependencies: [list]

**Requirements:**
1. [Requirement 1]
2. [Requirement 2]

**Success Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Deadline:** [Date]
```

**Workflow:**
1. Read task and understand requirements
2. Review related code and database schema
3. Design solution (document if complex)
4. Implement changes with error handling
5. Add logging for debugging
6. Write/update tests
7. Update API documentation
8. Handoff to QA for testing

**Output Format:**
```markdown
### TASK COMPLETED: [Task Name]
**Status:** ✅ DONE / ⚠️ PARTIAL / ❌ BLOCKED

**Changes Made:**
- [File 1]: [Description]
- [File 2]: [Description]

**Database Changes:**
- [Migration file created/updated]
- [Tables affected]

**API Changes:**
- [New/modified endpoints]
- [Breaking changes if any]

**Testing:**
- [ ] Unit tests added/updated
- [ ] Integration tests passing
- [ ] Manual testing completed

**Next Steps:**
- [Handoff to QA for integration testing]
- [Frontend needs to update API calls]

**Blockers:**
- [List any blockers encountered]

**Files Modified:**
[List of files with line counts]

**Time Spent:** [X hours]
```

### Success Metrics
- API response time <500ms (p95)
- Test coverage ≥70% for services
- Zero security vulnerabilities
- All endpoints documented in `/docs/API.md`
- Code review approval from peer

### Common Tasks
1. Implement new API endpoints
2. Add/modify database migrations
3. Create/update business logic in services
4. Implement authentication/authorization
5. Optimize database queries
6. Fix backend bugs
7. Add error handling and logging
8. Performance optimization

---

## AGENT 2: FRONTEND LEAD

### Charter
**Own all client-side code, UI components, pages, hooks, and user experience.**

### Responsibility Matrix

| Area | Owns | Collaborates | Consults |
|------|------|--------------|----------|
| Pages | ✅ | Backend, QA | UX Designer |
| Components | ✅ | - | Backend |
| Hooks | ✅ | Backend | - |
| UI/UX | ✅ | - | Designer |
| Routing | ✅ | - | Backend |
| State Management | ✅ | - | Backend |
| Forms & Validation | ✅ | Backend | - |
| Responsive Design | ✅ | - | Designer |

### Key Files & Directories
```
/client/src/
├── App.tsx                     # Root component (OWNS)
├── pages/*.tsx                 # Page components (OWNS)
├── components/*.tsx            # Reusable components (OWNS)
├── components/ui/*.tsx         # UI primitives (OWNS)
├── hooks/*.ts                  # Custom hooks (OWNS)
├── lib/
│   ├── queryClient.ts         # TanStack Query setup (OWNS)
│   └── utils.ts               # Utility functions (OWNS)
└── data/
    └── suppliers.ts           # Mock data (DEPRECATE)
```

### Input/Workflow/Output Structure

**Input Format:**
```markdown
### TASK: [Task Name]
**Priority:** P0/P1/P2
**Type:** New Feature / Bug Fix / Enhancement / Refactor

**User Story:**
As a [user type], I want to [action] so that [benefit].

**Design:**
- Mockup: [link or description]
- Acceptance criteria: [list]

**API Endpoints:**
- [Endpoint 1]: [Description]
- [Endpoint 2]: [Description]

**Success Criteria:**
- [ ] Meets design specs
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Fast load time (<2s)
```

**Workflow:**
1. Review user story and design
2. Identify components to create/modify
3. Implement UI with accessibility in mind
4. Connect to backend APIs using hooks
5. Handle loading, error, and empty states
6. Test on multiple screen sizes
7. Add component tests
8. Handoff to QA for E2E testing

**Output Format:**
```markdown
### TASK COMPLETED: [Task Name]
**Status:** ✅ DONE / ⚠️ NEEDS REVIEW / ❌ BLOCKED

**Components Created/Modified:**
- [Component 1]: [Purpose]
- [Component 2]: [Purpose]

**Pages Updated:**
- [Page 1]: [Changes]

**API Integration:**
- [Endpoint]: [Hook used]

**Accessibility:**
- [ ] Keyboard navigation
- [ ] Screen reader tested
- [ ] ARIA labels added
- [ ] Color contrast verified

**Responsive:**
- [ ] Mobile (320px-767px)
- [ ] Tablet (768px-1023px)
- [ ] Desktop (1024px+)

**Testing:**
- [ ] Component tests added
- [ ] Manual testing completed
- [ ] Cross-browser testing

**Screenshots:**
[Attach before/after or link to preview]

**Time Spent:** [X hours]
```

### Success Metrics
- Bundle size <600KB gzipped
- Lighthouse score ≥90
- Zero console errors
- All components accessible (WCAG 2.1 AA)
- Component test coverage ≥60%

### Common Tasks
1. Build new page components
2. Create reusable UI components
3. Implement forms with validation
4. Connect UI to backend APIs
5. Handle error and loading states
6. Implement responsive design
7. Fix UI bugs
8. Optimize bundle size and performance

---

## AGENT 3: LLM/PROMPT ENGINEERING LEAD

### Charter
**Own all AI/ML features, prompt engineering, model integration, and intelligent automation.**

### Responsibility Matrix

| Area | Owns | Collaborates | Consults |
|------|------|--------------|----------|
| Supplier Matching | ✅ | Backend | Data |
| Contract Generation | ✅ | Integration | Legal |
| Market Intelligence | ✅ | Data | Backend |
| Image Processing | ✅ | Integration | Frontend |
| Content Generation | ✅ | Backend | Marketing |
| Prompt Engineering | ✅ | - | All |
| Model Selection | ✅ | - | Data |
| Accuracy Tuning | ✅ | QA | Data |

### Key Files & Directories
```
/server/services/
├── perplexityService.ts       # Market intelligence (OWNS)
├── geminiService.ts            # AI image processing (OWNS)
├── rfqService.ts               # Supplier matching logic (COLLABORATES)
├── procurementService.ts       # Contract generation (OWNS)
└── contentGenerationService.ts # AI content (OWNS)
```

### Input/Workflow/Output Structure

**Input Format:**
```markdown
### TASK: [LLM Feature Name]
**Objective:** [What should the AI accomplish?]
**Input Data:** [What data will be provided?]
**Expected Output:** [What should the AI return?]

**Constraints:**
- Response time: [X seconds]
- Cost per request: [<$X]
- Accuracy target: [X%]

**Training Data:**
- [Available training data or where to get it]

**Success Criteria:**
- [ ] Accuracy ≥ [X%]
- [ ] Response time < [X seconds]
- [ ] Cost per request < $[X]
```

**Workflow:**
1. Understand the AI task and constraints
2. Design prompt structure (system, user, examples)
3. Select appropriate model (GPT-4, Claude, Gemini, etc.)
4. Implement prompt with few-shot examples
5. Test with sample data
6. Measure accuracy against ground truth
7. Iterate on prompt to improve accuracy
8. Optimize for cost and latency
9. Implement fallback logic
10. Document prompt and performance

**Output Format:**
```markdown
### TASK COMPLETED: [LLM Feature Name]
**Status:** ✅ DONE / ⚠️ TUNING NEEDED / ❌ BELOW TARGET

**Implementation:**
- Model: [GPT-4, Claude, Gemini, etc.]
- Prompt: [Link to prompt file or inline]
- Temperature: [X]
- Max tokens: [X]

**Performance:**
- Accuracy: [X%] (target: [Y%])
- Response time: [X seconds] (target: <[Y] seconds)
- Cost per request: $[X] (target: <$[Y])

**Test Results:**
- [Number] test samples
- [X%] passed accuracy threshold
- Edge cases: [Description]

**Prompt:**
```
[Full prompt text]
```

**Next Steps:**
- [Tuning needed?]
- [Additional training data needed?]
- [Cost optimization opportunities?]

**Time Spent:** [X hours]
```

### Success Metrics
- Supplier matching accuracy ≥85%
- Contract generation success rate ≥90%
- API response time <3s for AI operations
- Cost per request <$0.10
- User satisfaction ≥4/5 stars

### Common Tasks
1. Design prompts for supplier matching
2. Generate contract templates from RFQ data
3. Synthesize market intelligence reports
4. Process images (enhancement, background removal)
5. Generate blog content and market summaries
6. A/B test prompt variations
7. Tune model parameters for accuracy
8. Implement fallback logic for API failures

---

## AGENT 4: DATA PIPELINE LEAD

### Charter
**Own all data integrations, ETL pipelines, market data feeds, caching, and real-time data streaming.**

### Responsibility Matrix

| Area | Owns | Collaborates | Consults |
|------|------|--------------|----------|
| Market Data Feeds | ✅ | LLM | Backend |
| ETL Pipelines | ✅ | Backend | - |
| Caching Strategy | ✅ | Backend | QA |
| Real-time Streams | ✅ | Backend | Frontend |
| Data Normalization | ✅ | - | Backend |
| Data Quality | ✅ | QA | Backend |
| Performance | ✅ | Backend | QA |

### Key Files & Directories
```
/server/services/
├── marketDataService.ts       # Market data aggregation (OWNS)
├── cacheService.ts            # Caching layer (OWNS)
├── websocketService.ts        # Real-time updates (OWNS)
├── perplexityService.ts       # Market intelligence (COLLABORATES)
└── fastmarketsService.ts      # Lithium prices (OWNS - NEW)

/server/db/migrations/
└── 008_market_intelligence.sql # Market data tables (OWNS)
```

### Input/Workflow/Output Structure

**Input Format:**
```markdown
### TASK: [Data Pipeline Name]
**Data Source:** [API, web scrape, database, etc.]
**Update Frequency:** [Real-time, 5min, hourly, daily]
**Data Volume:** [Records per day]

**Data Schema:**
- Field 1: [Type, description]
- Field 2: [Type, description]

**Requirements:**
- Freshness: [<X minutes]
- Uptime: [X%]
- Error handling: [Strategy]

**Success Criteria:**
- [ ] Data freshness <X minutes
- [ ] API uptime ≥X%
- [ ] Zero data quality issues
```

**Workflow:**
1. Understand data source and schema
2. Design ETL pipeline (extract, transform, load)
3. Implement data extraction with error handling
4. Transform and normalize data
5. Store in database with indexing
6. Implement caching strategy
7. Add monitoring and alerting
8. Test with production-like data volume
9. Document data flow and dependencies

**Output Format:**
```markdown
### TASK COMPLETED: [Data Pipeline Name]
**Status:** ✅ OPERATIONAL / ⚠️ DEGRADED / ❌ FAILED

**Data Flow:**
[Source] → [ETL Process] → [Cache] → [Database] → [API]

**Implementation:**
- Extraction: [Method, frequency]
- Transformation: [Normalization logic]
- Storage: [Table, indexes]
- Caching: [Strategy, TTL]

**Performance:**
- Data freshness: [X minutes] (target: <[Y] minutes)
- API uptime: [X%] (target: ≥[Y%])
- Cache hit rate: [X%] (target: ≥80%)
- Query time: [X ms] (target: <100ms)

**Monitoring:**
- [ ] Alerts configured
- [ ] Dashboard created
- [ ] Error logging enabled

**Data Quality:**
- [ ] Schema validation
- [ ] Null checks
- [ ] Duplicate detection

**Time Spent:** [X hours]
```

### Success Metrics
- Data freshness <5 minutes
- API uptime ≥99.5%
- Cache hit rate ≥80%
- Zero data quality issues
- Query time <100ms

### Common Tasks
1. Integrate market data APIs (Bloomberg, Reuters, etc.)
2. Implement caching for expensive queries
3. Build real-time data streams (WebSocket)
4. Normalize and transform data
5. Monitor data quality
6. Optimize query performance
7. Handle API rate limits and errors
8. Build data aggregation pipelines

---

## AGENT 5: INTEGRATION LEAD

### Charter
**Own all third-party integrations, API orchestration, DevOps, CI/CD, and deployment infrastructure.**

### Responsibility Matrix

| Area | Owns | Collaborates | Consults |
|------|------|--------------|----------|
| Video Calls (Daily.co) | ✅ | Backend | Frontend |
| Payments (Stripe) | ✅ | Backend | QA |
| e-Signature (DocuSign) | ✅ | LLM | Backend |
| Email Service | ✅ | Backend | - |
| CI/CD Pipeline | ✅ | QA | All |
| Deployment | ✅ | QA | Backend |
| Monitoring | ✅ | Backend | QA |
| Circuit Breakers | ✅ | Backend | - |

### Key Files & Directories
```
/server/services/
├── videoService.ts            # Daily.co integration (OWNS)
├── docuSignService.ts         # e-Signature (OWNS)
├── escrowService.ts           # Stripe payments (OWNS)
├── emailService.ts            # Email notifications (OWNS)
└── calendarService.ts         # Calendar integration (OWNS)

/server/utils/
├── circuitBreaker.ts          # Circuit breaker pattern (OWNS)
└── retry.ts                   # Retry logic (OWNS)

/.github/workflows/
├── ci.yml                     # CI pipeline (OWNS)
└── deploy-*.yml               # Deployment pipelines (OWNS)
```

### Input/Workflow/Output Structure

**Input Format:**
```markdown
### TASK: [Integration Name]
**Service:** [Daily.co, Stripe, DocuSign, etc.]
**Purpose:** [What does this integration enable?]
**Documentation:** [Link to vendor API docs]

**Requirements:**
- API keys needed: [List]
- OAuth flow: [Yes/No]
- Webhooks: [Yes/No]

**Success Criteria:**
- [ ] Authentication working
- [ ] Core functionality operational
- [ ] Error handling implemented
- [ ] Circuit breaker configured
```

**Workflow:**
1. Review vendor API documentation
2. Obtain API credentials (keys, OAuth tokens)
3. Implement authentication
4. Build core integration logic
5. Add error handling and retries
6. Implement circuit breaker
7. Setup webhooks (if applicable)
8. Test with vendor sandbox/test mode
9. Document integration and configuration
10. Handoff to QA for testing

**Output Format:**
```markdown
### TASK COMPLETED: [Integration Name]
**Status:** ✅ OPERATIONAL / ⚠️ PARTIAL / ❌ BLOCKED

**Integration Details:**
- Service: [Name]
- API Version: [X]
- Environment: [Sandbox/Production]
- Authentication: [API Key, OAuth, etc.]

**Implementation:**
- Core functionality: [Description]
- Error handling: [Strategy]
- Circuit breaker: [Configured]
- Retry logic: [Exponential backoff]

**Configuration:**
- Environment variables: [List]
- Webhooks: [URL, events]
- Rate limits: [X requests/min]

**Testing:**
- [ ] Connection test passing
- [ ] Core functionality tested
- [ ] Error scenarios tested
- [ ] Webhook delivery verified

**Documentation:**
- [ ] Setup guide written
- [ ] API usage documented
- [ ] Troubleshooting guide

**Next Steps:**
- [Production credentials needed]
- [Additional testing in staging]

**Time Spent:** [X hours]
```

### Success Metrics
- External API success rate ≥99%
- Circuit breaker triggers <5/day
- Retry success rate ≥95%
- All integrations documented
- Zero credential leaks

### Common Tasks
1. Integrate Daily.co for video calls
2. Implement Stripe payment processing
3. Setup DocuSign e-signature workflow
4. Configure email service (SMTP)
5. Build CI/CD pipeline
6. Deploy to staging/production
7. Setup monitoring and alerts
8. Implement circuit breakers for external APIs

---

## AGENT 6: QA/TESTING LEAD

### Charter
**Own all testing infrastructure, test coverage, quality assurance, and CI/CD testing automation.**

### Responsibility Matrix

| Area | Owns | Collaborates | Consults |
|------|------|--------------|----------|
| Unit Tests | ✅ | Backend, Frontend | - |
| Integration Tests | ✅ | Backend | - |
| E2E Tests | ✅ | Frontend | - |
| Performance Tests | ✅ | Backend, Data | - |
| Security Tests | ✅ | Backend | Security Expert |
| CI/CD Testing | ✅ | Integration | - |
| Test Coverage | ✅ | All | - |
| Bug Tracking | ✅ | All | - |

### Key Files & Directories
```
/server/__tests__/
├── integration/*.test.ts      # Integration tests (OWNS)
└── fixtures/*.ts              # Test data (OWNS)

/client/src/**/__tests__/
└── *.test.tsx                 # Component tests (OWNS)

/vitest.config.ts              # Test configuration (OWNS)
/.github/workflows/ci.yml      # CI testing (COLLABORATES)
```

### Input/Workflow/Output Structure

**Input Format:**
```markdown
### TASK: Test [Feature Name]
**Feature:** [Description]
**Files to Test:** [List]
**Test Types:** Unit / Integration / E2E / Performance

**Critical Paths:**
1. [Path 1]
2. [Path 2]

**Success Criteria:**
- [ ] Test coverage ≥X%
- [ ] All tests passing
- [ ] No regressions
```

**Workflow:**
1. Understand feature and critical paths
2. Design test cases (happy path, edge cases, errors)
3. Create test data/fixtures
4. Write unit tests for functions
5. Write integration tests for workflows
6. Write E2E tests for user journeys
7. Run tests and verify coverage
8. Fix failing tests
9. Add to CI pipeline
10. Document test strategy

**Output Format:**
```markdown
### TASK COMPLETED: Test [Feature Name]
**Status:** ✅ ALL PASSING / ⚠️ SOME FAILING / ❌ BLOCKED

**Tests Created:**
- Unit tests: [X files, Y test cases]
- Integration tests: [X files, Y test cases]
- E2E tests: [X files, Y test cases]

**Coverage:**
- Overall: [X%]
- Critical paths: [100%]
- Files tested: [X/Y]

**Test Results:**
- ✅ Passing: [X tests]
- ❌ Failing: [Y tests]
- ⏭️ Skipped: [Z tests]

**Failing Tests:**
- [Test 1]: [Reason, owner]
- [Test 2]: [Reason, owner]

**Performance:**
- Test execution time: [X seconds]

**Next Steps:**
- [Fix failing tests]
- [Add tests for edge cases]

**Time Spent:** [X hours]
```

### Success Metrics
- Overall test coverage ≥70%
- Critical path coverage 100%
- All tests passing (green CI)
- Test execution time <5 minutes
- Zero flaky tests

### Common Tasks
1. Write unit tests for services
2. Write integration tests for API endpoints
3. Write component tests for UI
4. Write E2E tests for user flows
5. Perform load testing
6. Conduct security testing
7. Review test coverage reports
8. Fix failing or flaky tests
9. Maintain CI/CD test pipelines

---

## COMMUNICATION PROTOCOLS

### Daily Standup Format (Async in Context File)

Each agent updates the `ORCHESTRATION_CONTEXT.md` file daily with:

```markdown
## AGENT: [Agent Name]
**Date:** [YYYY-MM-DD]

### Completed Yesterday:
- [Task 1] - [Status]
- [Task 2] - [Status]

### Working Today:
- [Task 1] - [Estimated completion]
- [Task 2] - [Estimated completion]

### Blockers:
- [Blocker 1] - [Owner, mitigation]
- None

### Needs Collaboration:
- [Agent X] - [What is needed]
- None

### Risks:
- [Risk 1] - [Impact, mitigation]
- None
```

---

### Handoff Protocol

When an agent completes work that requires another agent, use this handoff format:

```markdown
---
## 🔄 HANDOFF TO: [Target Agent]

**From:** [Current Agent]
**Task:** [Task Name]
**Priority:** P0/P1/P2
**Blocking:** Yes/No

**Completed Work:**
- [Item 1]
- [Item 2]

**Files Modified:**
- [File 1]: [Changes]
- [File 2]: [Changes]

**What's Needed:**
[Clear description of what the receiving agent needs to do]

**Context:**
- [Relevant background info]
- [Decisions made]
- [Constraints]

**Success Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Deadline:** [Date]

**Collaboration:**
[Any ongoing collaboration needed]

---
```

---

### Blocker Escalation

When an agent encounters a blocker:

1. **Document in Context File:**
   ```markdown
   ## 🚨 BLOCKER: [Blocker ID]
   **Agent:** [Agent Name]
   **Task:** [Task Name]
   **Impact:** HIGH/MEDIUM/LOW
   **Description:** [What is blocked]
   **Attempted Solutions:** [What was tried]
   **Needed:** [What is needed to unblock]
   **Owner:** [Who can unblock]
   **Escalated:** [Date/Time]
   ```

2. **Notify Chief Execution Agent**
3. **Attempt Mitigation:** Try workaround if possible
4. **Escalate to Human:** If blocker unresolved within 24 hours

---

### Code Review Protocol

Before merging significant changes:

1. **Self-Review:**
   - [ ] Code follows style guide
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No console.log or debug code
   - [ ] Error handling present

2. **Peer Review:**
   - Create PR with description
   - Tag relevant agent for review
   - Address feedback
   - Get approval

3. **Merge Criteria:**
   - [ ] CI/CD passing
   - [ ] Code review approved
   - [ ] No merge conflicts
   - [ ] Documentation updated

---

## DECISION FRAMEWORK

### When to Make Decisions Independently

**Agents can decide independently:**
- Implementation details within their domain
- Code structure and patterns
- Test strategies
- Performance optimizations
- Minor bug fixes
- Documentation updates

**Example:** Backend Lead can decide how to structure a service, which database indexes to add, or how to optimize a query.

---

### When to Collaborate

**Require collaboration:**
- API contract changes (Backend + Frontend)
- Database schema changes (Backend + all)
- New external integrations (Integration + Backend)
- UI/UX changes (Frontend + Product Owner)
- Performance impacting changes (Agent + Data/Backend)
- Security changes (Backend/Integration + QA)

**Example:** Changing an API response format requires Backend + Frontend + QA collaboration.

---

### When to Escalate to Chief Execution Agent

**Escalate when:**
- Major architectural decisions
- Significant scope changes
- Timeline impacts (>1 day delay)
- Budget implications
- Security vulnerabilities
- Cross-phase dependencies
- Unresolved conflicts between agents

**Example:** Discovering that WebSocket implementation will take 2 extra days should be escalated immediately.

---

## DEPENDENCY RESOLUTION

### Sequential Dependencies

**Pattern:** Task B cannot start until Task A is complete

**Example:**
- Database RLS policies (Backend) → RLS tests (QA)
- Video integration (Integration) → Video call UI (Frontend)
- Market data feed (Data) → Price dashboard (Frontend)

**Protocol:**
1. Agent A updates context file with completion status
2. Agent A explicitly hands off to Agent B
3. Agent B confirms receipt and starts work
4. Chief Execution Agent monitors progress

---

### Parallel Dependencies

**Pattern:** Tasks A and B can run simultaneously but must sync at the end

**Example:**
- RFQ backend logic (Backend) + RFQ UI (Frontend)
- Payment integration (Integration) + Payment UI (Frontend)

**Protocol:**
1. Both agents start simultaneously
2. Agree on API contract upfront
3. Update context file with progress
4. Sync meeting when both ~80% complete
5. Integration testing when both done

---

### Circular Dependencies

**Pattern:** Task A needs partial output from Task B, and vice versa

**Example:**
- LLM supplier matching (LLM) needs RFQ data (Backend)
- RFQ service (Backend) needs matching algorithm (LLM)

**Protocol:**
1. Identify circular dependency early
2. Break into phases:
   - Phase 1: Backend creates RFQ service with basic matching
   - Phase 2: LLM implements advanced matching
   - Phase 3: Backend integrates advanced matching
3. Document phases in context file
4. Chief Execution Agent coordinates transitions

---

## QUALITY GATES

### Phase Completion Checklist

Before marking a phase complete, Chief Execution Agent verifies:

**Code Quality:**
- [ ] All code reviewed and approved
- [ ] No TODO or FIXME comments
- [ ] Consistent code style
- [ ] No console.log or debug code

**Testing:**
- [ ] Test coverage ≥ target
- [ ] All tests passing
- [ ] No flaky tests
- [ ] Performance tests passed

**Documentation:**
- [ ] API documentation updated
- [ ] User documentation updated
- [ ] Technical documentation updated
- [ ] README files updated

**Deployment:**
- [ ] CI/CD pipeline green
- [ ] Staging deployment successful
- [ ] Smoke tests passing
- [ ] Rollback plan tested

**Security:**
- [ ] No known vulnerabilities
- [ ] Security best practices followed
- [ ] Secrets management verified
- [ ] Access controls implemented

---

## AGENT PERFORMANCE METRICS

### Tracked Metrics

| Metric | Target | Frequency |
|--------|--------|-----------|
| Task Completion Rate | ≥90% | Weekly |
| Blocker Resolution Time | <24 hours | Per blocker |
| Test Coverage | ≥70% | Per PR |
| Code Review Turnaround | <4 hours | Per PR |
| Bug Introduction Rate | <5/week | Weekly |
| Documentation Completeness | 100% | Per feature |

### Agent Retrospectives

**Weekly retrospective format:**

```markdown
## AGENT RETROSPECTIVE: [Agent Name]
**Week:** [Week of YYYY-MM-DD]

### Achievements:
- [Achievement 1]
- [Achievement 2]

### Challenges:
- [Challenge 1] - [How addressed]
- [Challenge 2] - [Still working on]

### Learnings:
- [Learning 1]
- [Learning 2]

### Process Improvements:
- [Improvement 1] - [Action]
- [Improvement 2] - [Action]

### Next Week Focus:
- [Focus area 1]
- [Focus area 2]
```

---

## EMERGENCY PROTOCOLS

### Production Incident

**Severity 1 (Critical - System Down):**
1. Integration Lead investigates immediately
2. Backend Lead on standby
3. All other agents pause non-critical work
4. Incident commander: Chief Execution Agent
5. Communication: Update status every 15 minutes
6. Post-mortem: Within 24 hours of resolution

**Severity 2 (High - Feature Broken):**
1. Owning agent investigates
2. QA Lead assists with reproduction
3. Fix within 4 hours
4. Deploy to production ASAP
5. Post-mortem: Within 48 hours

**Severity 3 (Medium - Degraded Performance):**
1. Owning agent creates bug ticket
2. Prioritize in next sprint
3. No immediate action required

---

## TOOLING & AUTOMATION

### Recommended Tools

**Communication:**
- Context file updates (primary)
- GitHub issues (tracking)
- Pull request comments (code review)

**Development:**
- VS Code (recommended IDE)
- GitHub Copilot (code assistance)
- Postman (API testing)

**Testing:**
- Vitest (unit/integration tests)
- Playwright (E2E tests)
- k6 or Artillery (load testing)

**Monitoring:**
- Sentry (error tracking)
- New Relic or DataDog (APM)
- CloudWatch (AWS infrastructure)

---

**END OF SUB-AGENT FRAMEWORK**
*This framework should be reviewed and updated based on team learnings*
