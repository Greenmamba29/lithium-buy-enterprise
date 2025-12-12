# Notion ↔ Supabase Sync Implementation Guide

This guide provides step-by-step instructions for implementing the bidirectional sync between Notion and Supabase.

## Prerequisites

1. **Notion API Access**
   - Create a Notion integration at https://www.notion.so/my-integrations
   - Generate an internal integration token
   - Grant access to the workspace where databases will be created

2. **Supabase Access**
   - Ensure you have admin access to Supabase project
   - Service role key for server-side operations
   - Database migration access

3. **Dependencies**
   ```bash
   npm install @notionhq/client
   ```

## Step 1: Create Notion Databases

### Option A: Manual Creation (Recommended for First Time)

1. Go to your Notion workspace
2. Create a new page: "LithiumBuy Database Sync"
3. For each database listed in the sync plan:
   - Create a new database
   - Add all properties with correct types
   - Note the database ID from the URL

### Option B: Automated Creation (Script)

We'll create a script to automate database creation:

```typescript
// scripts/create-notion-databases.ts
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function createSuppliersDatabase() {
  const response = await notion.databases.create({
    parent: {
      type: 'page_id',
      page_id: process.env.NOTION_PARENT_PAGE_ID!,
    },
    title: [
      {
        type: 'text',
        text: {
          content: 'Suppliers',
        },
      },
    ],
    properties: {
      'Name': {
        title: {},
      },
      'Supabase ID': {
        type: 'rich_text',
      },
      'Logo URL': {
        type: 'url',
      },
      'Verification Tier': {
        type: 'select',
        select: {
          options: [
            { name: 'Gold', color: 'yellow' },
            { name: 'Silver', color: 'gray' },
            { name: 'Bronze', color: 'brown' },
          ],
        },
      },
      'Rating': {
        type: 'number',
        number: {
          format: 'number',
        },
      },
      'Review Count': {
        type: 'number',
        number: {
          format: 'number',
        },
      },
      'Transaction Count': {
        type: 'number',
        number: {
          format: 'number',
        },
      },
      'Response Time': {
        type: 'rich_text',
      },
      'Years in Business': {
        type: 'number',
        number: {
          format: 'number',
        },
      },
      'Created At': {
        type: 'date',
        date: {},
      },
      'Updated At': {
        type: 'date',
        date: {},
      },
      'Last Synced': {
        type: 'date',
        date: {},
      },
    },
  });
  
  console.log('Suppliers database created:', response.id);
  return response.id;
}

// Repeat for other databases...
```

## Step 2: Install Dependencies

```bash
npm install @notionhq/client
npm install --save-dev @types/node
```

## Step 3: Create Notion Client Service

```typescript
// server/services/notion/client.ts
import { Client } from '@notionhq/client';
import { logger } from '../../utils/logger.js';

export class NotionClient {
  private client: Client;
  private databaseIds: Map<string, string>;

  constructor(apiKey: string) {
    this.client = new Client({ auth: apiKey });
    this.databaseIds = new Map();
    this.loadDatabaseIds();
  }

  private loadDatabaseIds() {
    // Load from environment variables
    this.databaseIds.set('suppliers', process.env.NOTION_DATABASE_SUPPLIERS_ID!);
    this.databaseIds.set('products', process.env.NOTION_DATABASE_PRODUCTS_ID!);
    this.databaseIds.set('rfqs', process.env.NOTION_DATABASE_RFQS_ID!);
    this.databaseIds.set('rfq_responses', process.env.NOTION_DATABASE_RFQ_RESPONSES_ID!);
    this.databaseIds.set('auctions', process.env.NOTION_DATABASE_AUCTIONS_ID!);
    this.databaseIds.set('orders', process.env.NOTION_DATABASE_ORDERS_ID!);
    this.databaseIds.set('user_profiles', process.env.NOTION_DATABASE_USER_PROFILES_ID!);
    this.databaseIds.set('sync_log', process.env.NOTION_DATABASE_SYNC_LOG_ID!);
  }

  async createPage(databaseId: string, properties: any) {
    try {
      const response = await this.client.pages.create({
        parent: { database_id: databaseId },
        properties,
      });
      logger.info({ databaseId, pageId: response.id }, 'Notion page created');
      return response;
    } catch (error) {
      logger.error({ error, databaseId }, 'Failed to create Notion page');
      throw error;
    }
  }

  async updatePage(pageId: string, properties: any) {
    try {
      const response = await this.client.pages.update({
        page_id: pageId,
        properties,
      });
      logger.info({ pageId }, 'Notion page updated');
      return response;
    } catch (error) {
      logger.error({ error, pageId }, 'Failed to update Notion page');
      throw error;
    }
  }

  async queryDatabase(databaseId: string, filter?: any) {
    try {
      const response = await this.client.databases.query({
        database_id: databaseId,
        filter,
      });
      return response.results;
    } catch (error) {
      logger.error({ error, databaseId }, 'Failed to query Notion database');
      throw error;
    }
  }

  async findPageBySupabaseId(databaseId: string, supabaseId: string) {
    const results = await this.queryDatabase(databaseId, {
      property: 'Supabase ID',
      rich_text: {
        equals: supabaseId,
      },
    });
    return results.length > 0 ? results[0] : null;
  }

  getDatabaseId(tableName: string): string {
    const id = this.databaseIds.get(tableName);
    if (!id) {
      throw new Error(`Database ID not found for table: ${tableName}`);
    }
    return id;
  }
}
```

## Step 4: Create Field Mapper

```typescript
// server/services/notion/mapper.ts

export interface FieldMapping {
  supabaseField: string;
  notionProperty: string;
  type: 'text' | 'number' | 'date' | 'select' | 'relation' | 'checkbox' | 'multi_select' | 'url' | 'email';
  transform?: (value: any) => any;
  reverseTransform?: (value: any) => any;
  relationDatabase?: string; // For relation types
}

export const SUPPLIERS_MAPPING: FieldMapping[] = [
  { supabaseField: 'id', notionProperty: 'Supabase ID', type: 'text' },
  { supabaseField: 'name', notionProperty: 'Name', type: 'text' },
  { supabaseField: 'logo_url', notionProperty: 'Logo URL', type: 'url' },
  {
    supabaseField: 'verification_tier',
    notionProperty: 'Verification Tier',
    type: 'select',
    transform: (v: string) => v.charAt(0).toUpperCase() + v.slice(1), // 'gold' -> 'Gold'
  },
  { supabaseField: 'rating', notionProperty: 'Rating', type: 'number' },
  { supabaseField: 'review_count', notionProperty: 'Review Count', type: 'number' },
  { supabaseField: 'transaction_count', notionProperty: 'Transaction Count', type: 'number' },
  { supabaseField: 'response_time', notionProperty: 'Response Time', type: 'text' },
  { supabaseField: 'years_in_business', notionProperty: 'Years in Business', type: 'number' },
  { supabaseField: 'created_at', notionProperty: 'Created At', type: 'date' },
  { supabaseField: 'updated_at', notionProperty: 'Updated At', type: 'date' },
];

export class FieldMapper {
  private mappings: Map<string, FieldMapping[]>;

  constructor() {
    this.mappings = new Map();
    this.mappings.set('suppliers', SUPPLIERS_MAPPING);
    // Add other mappings...
  }

  supabaseToNotion(tableName: string, supabaseRecord: any): any {
    const mapping = this.mappings.get(tableName);
    if (!mapping) {
      throw new Error(`No mapping found for table: ${tableName}`);
    }

    const properties: any = {};

    for (const fieldMap of mapping) {
      const value = supabaseRecord[fieldMap.supabaseField];
      if (value === null || value === undefined) {
        continue;
      }

      const transformedValue = fieldMap.transform ? fieldMap.transform(value) : value;
      properties[fieldMap.notionProperty] = this.formatNotionProperty(
        fieldMap.type,
        transformedValue,
        fieldMap.relationDatabase
      );
    }

    // Add sync metadata
    properties['Last Synced'] = {
      date: {
        start: new Date().toISOString(),
      },
    };

    return properties;
  }

  notionToSupabase(tableName: string, notionPage: any): any {
    const mapping = this.mappings.get(tableName);
    if (!mapping) {
      throw new Error(`No mapping found for table: ${tableName}`);
    }

    const record: any = {};

    for (const fieldMap of mapping) {
      const notionProp = notionPage.properties[fieldMap.notionProperty];
      if (!notionProp) {
        continue;
      }

      const value = this.extractNotionValue(notionProp, fieldMap.type);
      if (value !== null && value !== undefined) {
        const transformedValue = fieldMap.reverseTransform
          ? fieldMap.reverseTransform(value)
          : value;
        record[fieldMap.supabaseField] = transformedValue;
      }
    }

    return record;
  }

  private formatNotionProperty(
    type: string,
    value: any,
    relationDatabase?: string
  ): any {
    switch (type) {
      case 'text':
        return {
          rich_text: [
            {
              text: {
                content: String(value),
              },
            },
          ],
        };
      case 'number':
        return {
          number: Number(value),
        };
      case 'date':
        return {
          date: {
            start: value instanceof Date ? value.toISOString() : value,
          },
        };
      case 'select':
        return {
          select: {
            name: String(value),
          },
        };
      case 'checkbox':
        return {
          checkbox: Boolean(value),
        };
      case 'url':
        return {
          url: String(value),
        };
      case 'email':
        return {
          email: String(value),
        };
      case 'relation':
        // This requires the related page ID
        return {
          relation: Array.isArray(value)
            ? value.map((id) => ({ id }))
            : [{ id: value }],
        };
      case 'multi_select':
        return {
          multi_select: Array.isArray(value)
            ? value.map((v) => ({ name: String(v) }))
            : [],
        };
      default:
        return {
          rich_text: [
            {
              text: {
                content: String(value),
              },
            },
          ],
        };
    }
  }

  private extractNotionValue(notionProp: any, type: string): any {
    switch (type) {
      case 'text':
        return notionProp.rich_text?.[0]?.text?.content || null;
      case 'number':
        return notionProp.number ?? null;
      case 'date':
        return notionProp.date?.start || null;
      case 'select':
        return notionProp.select?.name || null;
      case 'checkbox':
        return notionProp.checkbox ?? false;
      case 'url':
        return notionProp.url || null;
      case 'email':
        return notionProp.email || null;
      case 'relation':
        return notionProp.relation?.[0]?.id || null;
      case 'multi_select':
        return notionProp.multi_select?.map((item: any) => item.name) || [];
      default:
        return notionProp.rich_text?.[0]?.text?.content || null;
    }
  }
}
```

## Step 5: Create Sync Orchestrator

```typescript
// server/services/sync/orchestrator.ts
import { NotionClient } from '../notion/client.js';
import { FieldMapper } from '../notion/mapper.js';
import { supabaseAdmin } from '../../db/client.js';
import { logger } from '../../utils/logger.js';

export class SyncOrchestrator {
  private notionClient: NotionClient;
  private fieldMapper: FieldMapper;

  constructor() {
    this.notionClient = new NotionClient(process.env.NOTION_API_KEY!);
    this.fieldMapper = new FieldMapper();
  }

  async syncRecord(
    tableName: string,
    recordId: string,
    operation: 'create' | 'update' | 'delete',
    direction: 'supabase_to_notion' | 'notion_to_supabase'
  ): Promise<void> {
    try {
      if (direction === 'supabase_to_notion') {
        await this.syncSupabaseToNotion(tableName, recordId, operation);
      } else {
        await this.syncNotionToSupabase(tableName, recordId, operation);
      }
    } catch (error) {
      logger.error(
        { error, tableName, recordId, operation, direction },
        'Sync failed'
      );
      throw error;
    }
  }

  private async syncSupabaseToNotion(
    tableName: string,
    recordId: string,
    operation: 'create' | 'update' | 'delete'
  ): Promise<void> {
    const databaseId = this.notionClient.getDatabaseId(tableName);

    if (operation === 'delete') {
      // Find and delete Notion page
      const notionPage = await this.notionClient.findPageBySupabaseId(
        databaseId,
        recordId
      );
      if (notionPage) {
        await this.notionClient.updatePage(notionPage.id, {
          archived: true,
        });
      }
      return;
    }

    // Fetch record from Supabase
    const { data: record, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .eq('id', recordId)
      .single();

    if (error || !record) {
      throw new Error(`Failed to fetch record: ${error?.message}`);
    }

    // Convert to Notion properties
    const properties = this.fieldMapper.supabaseToNotion(tableName, record);

    // Find existing Notion page
    const existingPage = await this.notionClient.findPageBySupabaseId(
      databaseId,
      recordId
    );

    if (existingPage) {
      // Update existing page
      await this.notionClient.updatePage(existingPage.id, properties);
      logger.info({ tableName, recordId, notionPageId: existingPage.id }, 'Updated Notion page');
    } else {
      // Create new page
      const newPage = await this.notionClient.createPage(databaseId, properties);
      logger.info({ tableName, recordId, notionPageId: newPage.id }, 'Created Notion page');
    }
  }

  private async syncNotionToSupabase(
    tableName: string,
    pageId: string,
    operation: 'create' | 'update' | 'delete'
  ): Promise<void> {
    // Implementation for Notion → Supabase sync
    // Similar pattern but in reverse
  }

  async initialSync(tableName: string): Promise<void> {
    logger.info({ tableName }, 'Starting initial sync');

    const databaseId = this.notionClient.getDatabaseId(tableName);

    // Fetch all records from Supabase
    const { data: records, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch records: ${error.message}`);
    }

    logger.info({ tableName, count: records.length }, 'Fetched records from Supabase');

    // Batch create/update in Notion
    for (const record of records) {
      try {
        await this.syncSupabaseToNotion(tableName, record.id, 'update');
      } catch (error) {
        logger.error({ error, recordId: record.id }, 'Failed to sync record');
      }
    }

    logger.info({ tableName }, 'Initial sync completed');
  }

  async incrementalSync(tableName: string, lastSyncTime: Date): Promise<void> {
    logger.info({ tableName, lastSyncTime }, 'Starting incremental sync');

    // Fetch records modified since last sync
    const { data: records, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .gte('updated_at', lastSyncTime.toISOString())
      .order('updated_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch records: ${error.message}`);
    }

    logger.info({ tableName, count: records.length }, 'Found updated records');

    // Sync each record
    for (const record of records) {
      try {
        await this.syncSupabaseToNotion(tableName, record.id, 'update');
      } catch (error) {
        logger.error({ error, recordId: record.id }, 'Failed to sync record');
      }
    }

    logger.info({ tableName }, 'Incremental sync completed');
  }
}
```

## Step 6: Create Sync Queue Worker

```typescript
// server/jobs/notionSync.ts
import { Worker } from 'bullmq';
import { SyncOrchestrator } from '../services/sync/orchestrator.js';
import { logger } from '../utils/logger.js';

export const notionSyncWorker = new Worker(
  'notion-sync',
  async (job) => {
    const { tableName, recordId, operation, direction } = job.data;
    const orchestrator = new SyncOrchestrator();

    logger.info({ jobId: job.id, tableName, recordId, operation }, 'Processing sync job');

    await orchestrator.syncRecord(tableName, recordId, operation, direction);

    logger.info({ jobId: job.id }, 'Sync job completed');
  },
  {
    connection: {
      host: process.env.UPSTASH_REDIS_REST_URL,
      password: process.env.UPSTASH_REDIS_REST_TOKEN,
    },
    concurrency: 5, // Process 5 jobs concurrently
  }
);

notionSyncWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Sync job completed successfully');
});

notionSyncWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err }, 'Sync job failed');
});
```

## Step 7: Add Environment Variables

Update `.env.example`:

```env
# Notion Integration
NOTION_API_KEY=secret_...
NOTION_PARENT_PAGE_ID=...
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
SYNC_INTERVAL_SECONDS=300
SYNC_BATCH_SIZE=100
SYNC_CONFLICT_STRATEGY=lww
```

## Step 8: Create Database Migration

```sql
-- server/db/migrations/013_notion_sync_infrastructure.sql

-- Sync queue table
CREATE TABLE IF NOT EXISTS notion_sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
  direction TEXT NOT NULL DEFAULT 'supabase_to_notion' CHECK (direction IN ('supabase_to_notion', 'notion_to_supabase')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_notion_sync_queue_status ON notion_sync_queue(status);
CREATE INDEX idx_notion_sync_queue_table_record ON notion_sync_queue(table_name, record_id);

-- Sync log table
CREATE TABLE IF NOT EXISTS notion_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  notion_page_id TEXT,
  direction TEXT NOT NULL,
  operation TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  duration_ms INTEGER,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notion_sync_log_table_record ON notion_sync_log(table_name, record_id);
CREATE INDEX idx_notion_sync_log_synced_at ON notion_sync_log(synced_at);

-- Trigger function to queue sync
CREATE OR REPLACE FUNCTION queue_notion_sync()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notion_sync_queue (table_name, record_id, operation, direction)
  VALUES (TG_TABLE_NAME, NEW.id, TG_OP, 'supabase_to_notion')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to relevant tables
CREATE TRIGGER suppliers_notion_sync_trigger
  AFTER INSERT OR UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION queue_notion_sync();

CREATE TRIGGER products_notion_sync_trigger
  AFTER INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION queue_notion_sync();

-- Add more triggers as needed...
```

## Step 9: Create Sync Scheduler

```typescript
// server/jobs/syncScheduler.ts
import { addJob } from './queue.js';
import { SyncOrchestrator } from '../services/sync/orchestrator.js';
import { logger } from '../utils/logger.js';
import { supabaseAdmin } from '../db/client.js';

export async function processSyncQueue() {
  if (!process.env.SYNC_ENABLED || process.env.SYNC_ENABLED !== 'true') {
    return;
  }

  logger.info('Processing Notion sync queue');

  // Fetch pending sync jobs from database
  const { data: pendingJobs, error } = await supabaseAdmin
    .from('notion_sync_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    logger.error({ error }, 'Failed to fetch sync queue');
    return;
  }

  logger.info({ count: pendingJobs.length }, 'Found pending sync jobs');

  // Add jobs to BullMQ queue
  for (const job of pendingJobs) {
    await addJob('notion-sync', {
      tableName: job.table_name,
      recordId: job.record_id,
      operation: job.operation,
      direction: job.direction,
      queueJobId: job.id, // Reference to database record
    });

    // Mark as processing
    await supabaseAdmin
      .from('notion_sync_queue')
      .update({ status: 'processing' })
      .eq('id', job.id);
  }
}

// Run every 5 minutes
if (process.env.SYNC_ENABLED === 'true') {
  setInterval(processSyncQueue, 5 * 60 * 1000);
  processSyncQueue(); // Run immediately on startup
}
```

## Step 10: Testing

### Test Initial Sync

```typescript
// scripts/test-notion-sync.ts
import { SyncOrchestrator } from '../server/services/sync/orchestrator.js';

async function testSync() {
  const orchestrator = new SyncOrchestrator();
  
  // Test with suppliers table
  await orchestrator.initialSync('suppliers');
  
  console.log('Initial sync completed');
}

testSync().catch(console.error);
```

## Next Steps

1. Run the database creation script or create databases manually
2. Update environment variables with Notion database IDs
3. Run initial sync for one table (test with suppliers)
4. Verify data appears correctly in Notion
5. Gradually add more tables
6. Set up monitoring and alerting

## Troubleshooting

### Common Issues

1. **"Database ID not found"**
   - Verify environment variables are set correctly
   - Check that database IDs match the actual Notion databases

2. **"Rate limit exceeded"**
   - Notion API has rate limits (3 requests per second)
   - Implement rate limiting in sync service
   - Use batch operations where possible

3. **"Property not found"**
   - Verify property names match exactly (case-sensitive)
   - Check that all properties exist in Notion database

4. **"Relation not found"**
   - Ensure related databases are created first
   - Verify relation property is set up correctly in Notion




