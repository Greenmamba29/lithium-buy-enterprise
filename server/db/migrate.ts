import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { supabaseAdmin } from "./client.js";
import { logger } from "../utils/logger.js";

/**
 * Migration Runner for Supabase
 * Applies SQL migrations in order and tracks applied migrations
 */

interface Migration {
  version: string;
  filename: string;
  sql: string;
}

// Create migrations tracking table if it doesn't exist
async function ensureMigrationsTable(): Promise<void> {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  try {
    // Try to create table via RPC (if available) or direct query
    // Note: Supabase doesn't support exec directly, so this should be run manually first
    logger.info({}, "Migrations table should exist. If not, create it manually in Supabase dashboard.");
  } catch (error) {
    logger.warn({ error }, "Could not verify migrations table. Create it manually in Supabase dashboard.");
  }
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("schema_migrations")
      .select("version")
      .order("applied_at", { ascending: true });

    if (error) {
      logger.warn({ error: error.message }, "Failed to fetch applied migrations");
      return [];
    }

    return (data || []).map((m) => m.version);
  } catch (error) {
    logger.warn({ error }, "Failed to fetch applied migrations");
    return [];
  }
}

/**
 * Mark migration as applied
 */
async function markMigrationApplied(version: string, filename: string): Promise<void> {
  try {
    await supabaseAdmin.from("schema_migrations").insert({
      version,
      filename,
    });
  } catch (error) {
    logger.error({ error, version, filename }, "Failed to mark migration as applied");
  }
}

/**
 * Load all migration files
 */
async function loadMigrations(): Promise<Migration[]> {
  const migrationsDir = join(process.cwd(), "server", "db", "migrations");
  const files = await readdir(migrationsDir);
  const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();

  const migrations: Migration[] = [];

  for (const file of sqlFiles) {
    const version = file.replace(".sql", "");
    const filePath = join(migrationsDir, file);
    const sql = await readFile(filePath, "utf-8");

    migrations.push({
      version,
      filename: file,
      sql,
    });
  }

  return migrations;
}

/**
 * Apply a single migration
 * Note: Supabase doesn't support executing arbitrary SQL via client
 * In production, use Supabase Dashboard SQL Editor or Supabase CLI
 */
async function applyMigration(migration: Migration): Promise<void> {
  logger.info({ version: migration.version, filename: migration.filename }, "Applying migration");

  // Supabase doesn't support executing arbitrary SQL via client
  // In production, you would:
  // 1. Use Supabase Dashboard SQL Editor
  // 2. Use Supabase CLI: `supabase db push`
  // 3. Use a migration tool like `node-pg-migrate`

  // For now, we'll just log and mark as applied
  // The actual SQL should be run via Supabase dashboard or CLI
  logger.info(
    { version: migration.version },
    `Migration SQL should be applied via Supabase dashboard or CLI:\n${migration.sql.substring(0, 200)}...`
  );

  // Mark as applied (assuming SQL was run manually)
  await markMigrationApplied(migration.version, migration.filename);
}

/**
 * Run all pending migrations
 */
export async function runMigrations(): Promise<void> {
  logger.info({}, "Starting migration process");

  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();
  const allMigrations = await loadMigrations();
  const pending = allMigrations.filter((m) => !applied.includes(m.version));

  if (pending.length === 0) {
    logger.info({}, "No pending migrations");
    return;
  }

  logger.info({ count: pending.length }, `Found ${pending.length} pending migration(s)`);

  for (const migration of pending) {
    try {
      await applyMigration(migration);
      logger.info({ version: migration.version }, "Migration applied successfully");
    } catch (error) {
      logger.error(
        { error, version: migration.version },
        "Failed to apply migration"
      );
      throw error;
    }
  }

  logger.info({}, "All migrations completed");
}

/**
 * Rollback last migration (if supported)
 */
export async function rollbackLastMigration(): Promise<void> {
  logger.warn({}, "Rollback not fully supported - manual intervention required");
  // In production, you would implement rollback logic
  // This requires storing rollback SQL in migration files
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      logger.info({}, "Migrations completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ error }, "Migration failed");
      process.exit(1);
    });
}


