# Notion ↔ Supabase Database Sync Plan

## Executive Summary

This document outlines a comprehensive plan to establish bidirectional synchronization between Notion databases and Supabase PostgreSQL database for the LithiumBuy Enterprise platform. The sync will ensure data consistency, enable collaborative workflows, and provide a unified view of business data across both systems.

## Current State Analysis

### Supabase Database Structure

**Core Business Tables:**
- `suppliers` - Supplier master data
- `supplier_profiles` - Extended supplier information
- `products` - Product catalog
- `quotes` - Quote requests and responses
- `orders` - Order management
- `reviews` - Supplier reviews
- `certifications` - Supplier certifications
- `locations` - Supplier locations

**RFQ/Procurement Tables:**
- `rfqs` - Request for Quote management
- `rfq_responses` - Supplier responses to RFQs
- `tenders` - Tender/negotiation management

**Auction Tables:**
- `auctions` - Auction listings
- `bids` - Auction bids

**Telebuy Tables:**
- `telebuy_sessions` - Video meeting sessions
- `telebuy_documents` - Session documents and contracts

**User Management:**
- `profiles` - User profiles (extends auth.users)
- `user_profiles` - Extended user information

**System Tables:**
- `audit_log` - Audit trail
- `conflicts` - Sync conflict tracking
- `directory_nodes` - Directory structure
- `search_sessions` - Search history
- `search_sources` - Search source data

### Notion Current State

Based on the Notion workspace analysis:
- Feature specifications and planning documents exist
- Database schemas are documented but **Notion databases are not yet created**
- Specs reference: Users, RFQs, RFQSupplierInvites, Bids, BidHistory, Auctions, Transactions, Contracts

### Integration Gaps

1. **No Notion databases exist** - Need to create matching databases
2. **No sync infrastructure** - Need to build sync service
3. **No conflict resolution** - Need to implement conflict handling
4. **No mapping layer** - Need to create field mapping between systems

---

## Phase 1: Notion Database Creation

### Step 1.1: Create Core Notion Databases

Create Notion databases that mirror Supabase tables with appropriate property types:

#### 1. Suppliers Database
**Properties:**
- `Name` (Title) - Maps to `suppliers.name`
- `ID` (Text, unique) - Maps to `suppliers.id`
- `Logo URL` (URL) - Maps to `suppliers.logo_url`
- `Verification Tier` (Select: Gold, Silver, Bronze) - Maps to `suppliers.verification_tier`
- `Rating` (Number, 0-5) - Maps to `suppliers.rating`
- `Review Count` (Number) - Maps to `suppliers.review_count`
- `Transaction Count` (Number) - Maps to `suppliers.transaction_count`
- `Response Time` (Text) - Maps to `suppliers.response_time`
- `Years in Business` (Number) - Maps to `suppliers.years_in_business`
- `Created At` (Date) - Maps to `suppliers.created_at`
- `Updated At` (Date) - Maps to `suppliers.updated_at`
- `Supabase ID` (Text, unique) - For sync tracking
- `Last Synced` (Date) - Sync metadata

#### 2. Products Database
**Properties:**
- `Name` (Title) - Maps to `products.name`
- `ID` (Text, unique) - Maps to `products.id`
- `Supplier` (Relation → Suppliers) - Maps to `products.supplier_id`
- `Product Type` (Select: Raw, Compound, Processed) - Maps to `products.product_type`
- `Purity Level` (Select: 99, 99.5, 99.9) - Maps to `products.purity_level`
- `Price Per Unit` (Number) - Maps to `products.price_per_unit`
- `Currency` (Select: USD, EUR, CNY, etc.) - Maps to `products.currency`
- `Unit` (Text) - Maps to `products.unit`
- `Min Order Quantity` (Number) - Maps to `products.min_order_quantity`
- `Availability` (Select: In Stock, Limited, Contact) - Maps to `products.availability`
- `Has Bulk Discount` (Checkbox) - Maps to `products.has_bulk_discount`
- `Bulk Discount Threshold` (Number) - Maps to `products.bulk_discount_threshold`
- `Bulk Discount Percentage` (Number) - Maps to `products.bulk_discount_percentage`
- `Created At` (Date) - Maps to `products.created_at`
- `Updated At` (Date) - Maps to `products.updated_at`
- `Supabase ID` (Text, unique) - For sync tracking
- `Last Synced` (Date) - Sync metadata

#### 3. RFQs Database
**Properties:**
- `Title` (Title) - Maps to `rfqs.title`
- `ID` (Text, unique) - Maps to `rfqs.id`
- `Buyer` (Relation → User Profiles) - Maps to `rfqs.buyer_id`
- `Description` (Text) - Maps to `rfqs.description`
- `Status` (Select: Draft, Published, Closed, Awarded, Cancelled) - Maps to `rfqs.status`
- `Product Type` (Select: Raw, Compound, Processed) - Maps to `rfqs.product_type`
- `Purity Level` (Select: 99, 99.5, 99.9) - Maps to `rfqs.purity_level`
- `Quantity` (Number) - Maps to `rfqs.quantity`
- `Unit` (Text) - Maps to `rfqs.unit`
- `Target Price` (Number) - Maps to `rfqs.target_price`
- `Currency` (Select) - Maps to `rfqs.currency`
- `Delivery Location Country` (Text) - Maps to `rfqs.delivery_location_country`
- `Delivery Location City` (Text) - Maps to `rfqs.delivery_location_city`
- `Required Certifications` (Multi-select) - Maps to `rfqs.required_certifications[]`
- `Deadline` (Date) - Maps to `rfqs.deadline`
- `Published At` (Date) - Maps to `rfqs.published_at`
- `Closed At` (Date) - Maps to `rfqs.closed_at`
- `Awarded To` (Relation → Suppliers) - Maps to `rfqs.awarded_to`
- `Created At` (Date) - Maps to `rfqs.created_at`
- `Updated At` (Date) - Maps to `rfqs.updated_at`
- `Supabase ID` (Text, unique) - For sync tracking
- `Last Synced` (Date) - Sync metadata

#### 4. RFQ Responses Database
**Properties:**
- `ID` (Title) - Auto-generated
- `RFQ` (Relation → RFQs) - Maps to `rfq_responses.rfq_id`
- `Supplier` (Relation → Suppliers) - Maps to `rfq_responses.supplier_id`
- `User` (Relation → User Profiles) - Maps to `rfq_responses.user_id`
- `Quote Price` (Number) - Maps to `rfq_responses.quote_price`
- `Currency` (Select) - Maps to `rfq_responses.currency`
- `Delivery Time Days` (Number) - Maps to `rfq_responses.delivery_time_days`
- `Payment Terms` (Text) - Maps to `rfq_responses.payment_terms`
- `Notes` (Text) - Maps to `rfq_responses.notes`
- `Status` (Select: Submitted, Under Review, Shortlisted, Rejected, Accepted) - Maps to `rfq_responses.status`
- `Score` (Number, 0-100) - Maps to `rfq_responses.score`
- `Created At` (Date) - Maps to `rfq_responses.created_at`
- `Updated At` (Date) - Maps to `rfq_responses.updated_at`
- `Supabase ID` (Text, unique) - For sync tracking
- `Last Synced` (Date) - Sync metadata

#### 5. Auctions Database
**Properties:**
- `Title` (Title) - Auto-generated from material/grade
- `ID` (Text, unique) - Maps to `auctions.id`
- `Supplier` (Relation → Suppliers) - Maps to `auctions.supplier_id`
- `Material` (Text) - Maps to `auctions.material`
- `Grade` (Text) - Maps to `auctions.grade`
- `Quantity` (Number) - Maps to `auctions.quantity`
- `Starting Price` (Number) - Maps to `auctions.starting_price`
- `Reserve Price` (Number) - Maps to `auctions.reserve_price`
- `Current Price` (Number) - Maps to `auctions.current_price`
- `Bid Increment` (Number) - Maps to `auctions.bid_increment`
- `Status` (Select: Draft, Active, Closed, Settled, Cancelled) - Maps to `auctions.status`
- `Start Time` (Date) - Maps to `auctions.start_time`
- `End Time` (Date) - Maps to `auctions.end_time`
- `Bid Count` (Number) - Maps to `auctions.bid_count`
- `Winner` (Relation → User Profiles) - Maps to `auctions.winner_id`
- `Created At` (Date) - Maps to `auctions.created_at`
- `Updated At` (Date) - Maps to `auctions.updated_at`
- `Supabase ID` (Text, unique) - For sync tracking
- `Last Synced` (Date) - Sync metadata

#### 6. Orders Database
**Properties:**
- `Order Number` (Title) - Auto-generated
- `ID` (Text, unique) - Maps to `orders.id`
- `Supplier` (Relation → Suppliers) - Maps to `orders.supplier_id`
- `User` (Relation → User Profiles) - Maps to `orders.user_id`
- `Quote` (Relation → Quotes) - Maps to `orders.quote_id`
- `Status` (Select: Pending, Confirmed, Shipped, Delivered, Cancelled) - Maps to `orders.status`
- `Total Amount` (Number) - Maps to `orders.total_amount`
- `Currency` (Select) - Maps to `orders.currency`
- `Payment Status` (Select: Pending, Paid, Failed, Refunded) - Maps to `orders.payment_status`
- `Created At` (Date) - Maps to `orders.created_at`
- `Updated At` (Date) - Maps to `orders.updated_at`
- `Supabase ID` (Text, unique) - For sync tracking
- `Last Synced` (Date) - Sync metadata

#### 7. User Profiles Database
**Properties:**
- `Name` (Title) - From auth.users
- `User ID` (Text, unique) - Maps to `user_profiles.user_id`
- `Company Name` (Text) - Maps to `user_profiles.company_name`
- `Phone` (Text) - Maps to `user_profiles.phone`
- `Role` (Select: Buyer, Supplier, Admin) - Maps to `user_profiles.role`
- `Email` (Email) - From auth.users
- `Created At` (Date) - Maps to `user_profiles.created_at`
- `Updated At` (Date) - Maps to `user_profiles.updated_at`
- `Supabase ID` (Text, unique) - For sync tracking
- `Last Synced` (Date) - Sync metadata

### Step 1.2: Create Sync Metadata Database in Notion

**Sync Log Database:**
- `Sync ID` (Title) - Unique sync operation ID
- `Table Name` (Select) - Which table was synced
- `Record ID` (Text) - Supabase record ID
- `Notion Page ID` (Text) - Notion page/database entry ID
- `Direction` (Select: Supabase→Notion, Notion→Supabase, Bidirectional)
- `Status` (Select: Success, Failed, Conflict)
- `Error Message` (Text) - If failed
- `Synced At` (Date) - Timestamp
- `Sync Duration` (Number) - Milliseconds

---

## Phase 2: Sync Service Architecture

### Step 2.1: Create Sync Service Structure

```
server/
  services/
    notion/
      client.ts          # Notion API client wrapper
      mapper.ts          # Field mapping between Supabase ↔ Notion
      sync.ts            # Core sync logic
      conflictResolver.ts # Conflict resolution strategies
    sync/
      orchestrator.ts    # Main sync orchestrator
      queue.ts           # Sync job queue
      scheduler.ts       # Scheduled sync jobs
```

### Step 2.2: Field Mapping Configuration

Create a mapping configuration file that defines how Supabase fields map to Notion properties:

```typescript
// server/services/notion/mapper.ts

export interface FieldMapping {
  supabaseField: string;
  notionProperty: string;
  type: 'text' | 'number' | 'date' | 'select' | 'relation' | 'checkbox' | 'multi_select';
  transform?: (value: any) => any; // Optional transformation function
  reverseTransform?: (value: any) => any; // For Notion → Supabase
}

export const SUPPLIERS_MAPPING: FieldMapping[] = [
  { supabaseField: 'id', notionProperty: 'Supabase ID', type: 'text' },
  { supabaseField: 'name', notionProperty: 'Name', type: 'text' },
  { supabaseField: 'logo_url', notionProperty: 'Logo URL', type: 'text' },
  { supabaseField: 'verification_tier', notionProperty: 'Verification Tier', type: 'select' },
  { supabaseField: 'rating', notionProperty: 'Rating', type: 'number' },
  // ... more mappings
];
```

### Step 2.3: Sync Strategies

**1. Initial Sync (One-time)**
- Pull all records from Supabase
- Create corresponding Notion database entries
- Mark all as synced

**2. Incremental Sync (Continuous)**
- Track `updated_at` timestamps
- Only sync records modified since last sync
- Use Supabase Realtime or polling

**3. Bidirectional Sync**
- Supabase → Notion: On Supabase changes (webhooks/triggers)
- Notion → Supabase: On Notion changes (polling or webhooks if available)

**4. Conflict Resolution**
- Last Write Wins (LWW) - Default for most fields
- Manual Review - For critical business data
- Field-level precedence - Certain fields always win from specific source

---

## Phase 3: Implementation Steps

### Step 3.1: Environment Setup

**Required Environment Variables:**
```env
# Notion Integration
NOTION_API_KEY=secret_...
NOTION_DATABASE_SUPPLIERS_ID=...
NOTION_DATABASE_PRODUCTS_ID=...
NOTION_DATABASE_RFQS_ID=...
NOTION_DATABASE_RFQ_RESPONSES_ID=...
NOTION_DATABASE_AUCTIONS_ID=...
NOTION_DATABASE_ORDERS_ID=...
NOTION_DATABASE_USER_PROFILES_ID=...
NOTION_DATABASE_SYNC_LOG_ID=...

# Sync Configuration
SYNC_ENABLED=true
SYNC_INTERVAL_SECONDS=300  # 5 minutes
SYNC_BATCH_SIZE=100
SYNC_CONFLICT_STRATEGY=lww  # lww, manual, field_precedence
```

### Step 3.2: Create Notion Client Service

```typescript
// server/services/notion/client.ts
import { Client } from '@notionhq/client';

export class NotionClient {
  private client: Client;
  
  constructor(apiKey: string) {
    this.client = new Client({ auth: apiKey });
  }
  
  async createPage(databaseId: string, properties: any) {
    return this.client.pages.create({
      parent: { database_id: databaseId },
      properties,
    });
  }
  
  async updatePage(pageId: string, properties: any) {
    return this.client.pages.update({
      page_id: pageId,
      properties,
    });
  }
  
  async queryDatabase(databaseId: string, filter?: any) {
    return this.client.databases.query({
      database_id: databaseId,
      filter,
    });
  }
  
  // ... more methods
}
```

### Step 3.3: Create Sync Service

```typescript
// server/services/sync/orchestrator.ts

export class SyncOrchestrator {
  async syncTable(tableName: string, direction: 'supabase_to_notion' | 'notion_to_supabase' | 'bidirectional') {
    // Implementation
  }
  
  async initialSync() {
    // One-time full sync
  }
  
  async incrementalSync() {
    // Sync only changed records
  }
  
  async handleConflict(supabaseRecord: any, notionRecord: any) {
    // Conflict resolution
  }
}
```

### Step 3.4: Create Database Triggers

Add Supabase database triggers to automatically queue sync jobs when data changes:

```sql
-- server/db/migrations/012_notion_sync_triggers.sql

-- Create sync queue table
CREATE TABLE IF NOT EXISTS notion_sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
  direction TEXT NOT NULL DEFAULT 'supabase_to_notion',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Trigger function to queue sync on supplier changes
CREATE OR REPLACE FUNCTION queue_notion_sync()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notion_sync_queue (table_name, record_id, operation, direction)
  VALUES (TG_TABLE_NAME, NEW.id, TG_OP, 'supabase_to_notion');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to relevant tables
CREATE TRIGGER suppliers_notion_sync_trigger
  AFTER INSERT OR UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION queue_notion_sync();

-- Repeat for other tables...
```

### Step 3.5: Create Sync Worker

```typescript
// server/jobs/notionSync.ts

import { Worker } from 'bullmq';
import { SyncOrchestrator } from '../services/sync/orchestrator.js';

export const notionSyncWorker = new Worker(
  'notion-sync',
  async (job) => {
    const { tableName, recordId, operation, direction } = job.data;
    const orchestrator = new SyncOrchestrator();
    
    await orchestrator.syncRecord(tableName, recordId, operation, direction);
  },
  {
    connection: {
      host: process.env.UPSTASH_REDIS_REST_URL,
      password: process.env.UPSTASH_REDIS_REST_TOKEN,
    },
  }
);
```

### Step 3.6: Create Scheduled Sync Jobs

```typescript
// server/jobs/syncScheduler.ts

import { addJob } from './queue.js';
import { SyncOrchestrator } from '../services/sync/orchestrator.js';

export async function scheduleIncrementalSync() {
  const orchestrator = new SyncOrchestrator();
  
  // Sync all tables incrementally
  const tables = ['suppliers', 'products', 'rfqs', 'rfq_responses', 'auctions', 'orders', 'user_profiles'];
  
  for (const table of tables) {
    await addJob('notion-sync', {
      tableName: table,
      direction: 'supabase_to_notion',
      type: 'incremental',
    });
  }
}

// Run every 5 minutes
setInterval(scheduleIncrementalSync, 5 * 60 * 1000);
```

---

## Phase 4: Conflict Resolution

### Step 4.1: Conflict Detection

Detect conflicts when:
- Same record modified in both systems since last sync
- Field-level conflicts (some fields changed in both)
- Deletion conflicts (deleted in one, modified in other)

### Step 4.2: Conflict Resolution Strategies

**1. Last Write Wins (LWW)**
- Compare `updated_at` timestamps
- Use the most recent version
- Log conflict for audit

**2. Field-Level Precedence**
- Certain fields always win from specific source
- Example: Price always from Supabase, Notes always from Notion

**3. Manual Review**
- Flag conflicts in `conflicts` table
- Create Notion page for review
- Admin resolves manually

### Step 4.3: Conflict Logging

```typescript
// server/services/sync/conflictResolver.ts

export async function logConflict(
  tableName: string,
  recordId: string,
  supabaseRecord: any,
  notionRecord: any,
  conflictFields: string[]
) {
  await supabaseAdmin.from('conflicts').insert({
    type: 'CONCURRENT_UPDATE',
    table: tableName,
    record_id: recordId,
    local_record: supabaseRecord,
    remote_record: notionRecord,
    detected_at: new Date().toISOString(),
  });
}
```

---

## Phase 5: Data Integrity & Validation

### Step 5.1: Pre-Sync Validation

- Validate data types match
- Check required fields
- Verify foreign key relationships
- Validate enum values

### Step 5.2: Post-Sync Verification

- Compare record counts
- Verify critical fields match
- Check sync timestamps
- Generate sync report

### Step 5.3: Rollback Mechanism

- Store pre-sync state
- Ability to rollback failed syncs
- Audit trail of all changes

---

## Phase 6: Monitoring & Observability

### Step 6.1: Sync Metrics

- Sync success rate
- Sync latency
- Conflict rate
- Records synced per hour
- Error rate by table

### Step 6.2: Alerting

- Failed syncs
- High conflict rate
- Sync queue backlog
- API rate limit warnings

### Step 6.3: Dashboard

Create admin dashboard showing:
- Sync status by table
- Recent sync operations
- Conflict queue
- Sync performance metrics

---

## Phase 7: Testing Strategy

### Step 7.1: Unit Tests

- Field mapping transformations
- Conflict resolution logic
- Data validation

### Step 7.2: Integration Tests

- End-to-end sync flows
- Conflict scenarios
- Error handling
- Rollback scenarios

### Step 7.3: Load Tests

- Bulk sync performance
- Concurrent sync operations
- Rate limiting behavior

---

## Implementation Timeline

### Week 1: Setup & Database Creation
- [ ] Create all Notion databases
- [ ] Set up Notion API integration
- [ ] Create field mapping configurations
- [ ] Set up environment variables

### Week 2: Core Sync Service
- [ ] Implement Notion client wrapper
- [ ] Implement sync orchestrator
- [ ] Create field mappers
- [ ] Basic Supabase → Notion sync

### Week 3: Bidirectional Sync
- [ ] Implement Notion → Supabase sync
- [ ] Add conflict detection
- [ ] Implement conflict resolution
- [ ] Add sync queue system

### Week 4: Automation & Monitoring
- [ ] Set up scheduled sync jobs
- [ ] Add database triggers
- [ ] Create monitoring dashboard
- [ ] Add alerting

### Week 5: Testing & Refinement
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Production deployment

---

## Risk Mitigation

### Risks

1. **Data Loss**
   - Mitigation: Always backup before sync, implement rollback

2. **Sync Conflicts**
   - Mitigation: Clear conflict resolution strategy, manual review for critical data

3. **API Rate Limits**
   - Mitigation: Implement rate limiting, batch operations, exponential backoff

4. **Performance Issues**
   - Mitigation: Incremental sync, batch processing, async operations

5. **Schema Mismatches**
   - Mitigation: Schema validation, versioning, migration scripts

---

## Success Criteria

- [ ] All core tables syncing successfully
- [ ] < 1% conflict rate
- [ ] < 5 minute sync latency
- [ ] 99.9% sync success rate
- [ ] Zero data loss incidents
- [ ] Complete audit trail
- [ ] Admin dashboard operational

---

## Next Steps

1. **Immediate Actions:**
   - Review and approve this plan
   - Set up Notion API access
   - Create Notion databases (use provided schemas)
   - Set up development environment

2. **Development:**
   - Start with Phase 1 (Notion database creation)
   - Implement Phase 2 (Sync service architecture)
   - Test with one table first (Suppliers)

3. **Iteration:**
   - Add tables incrementally
   - Refine based on usage patterns
   - Optimize performance

---

## Appendix: Field Mapping Reference

See detailed field mappings in `server/services/notion/mappings/` directory (to be created).

## Appendix: Notion Database IDs

After creating Notion databases, document their IDs in `.env` file for sync service configuration.




