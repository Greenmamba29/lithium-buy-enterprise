import { supabaseAdmin } from "../db/client.js";
import { logger } from "./logger.js";

/**
 * Transaction Utilities
 * 
 * Supabase doesn't support traditional transactions via the client,
 * but we can use PostgreSQL RPC functions or implement transaction-like
 * behavior using error handling and rollback logic.
 * 
 * For multi-table operations, we'll use a pattern that:
 * 1. Attempts all operations
 * 2. Tracks successful operations
 * 3. Rolls back on any failure
 */

export interface TransactionOperation<T = any> {
  execute: () => Promise<T>;
  rollback?: (result: T) => Promise<void>;
  description: string;
}

export interface TransactionResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
  operationsCompleted: number;
}

/**
 * Execute multiple operations in a transaction-like manner
 * If any operation fails, all previous operations are rolled back
 */
export async function executeTransaction<T = any>(
  operations: TransactionOperation[],
  options?: {
    continueOnError?: boolean;
    logOperations?: boolean;
  }
): Promise<TransactionResult<T>> {
  const results: any[] = [];
  const completedOperations: Array<{ operation: TransactionOperation; result: any }> = [];
  let lastError: Error | undefined;

  logger.info(
    { operationCount: operations.length },
    `Starting transaction with ${operations.length} operations`
  );

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];

    try {
      if (options?.logOperations) {
        logger.debug({ operation: operation.description }, "Executing operation");
      }

      const result = await operation.execute();
      results.push(result);
      completedOperations.push({ operation, result });

      if (options?.logOperations) {
        logger.debug(
          { operation: operation.description, index: i },
          "Operation completed successfully"
        );
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      logger.error(
        {
          operation: operation.description,
          index: i,
          error: lastError.message,
        },
        "Operation failed, rolling back transaction"
      );

      // Rollback all completed operations in reverse order
      for (let j = completedOperations.length - 1; j >= 0; j--) {
        const { operation: completedOp, result } = completedOperations[j];
        if (completedOp.rollback) {
          try {
            await completedOp.rollback(result);
            logger.debug(
              { operation: completedOp.description },
              "Rolled back operation"
            );
          } catch (rollbackError) {
            logger.error(
              {
                operation: completedOp.description,
                error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
              },
              "Failed to rollback operation"
            );
          }
        }
      }

      if (!options?.continueOnError) {
        return {
          success: false,
          error: lastError,
          operationsCompleted: i,
        };
      }
    }
  }

  logger.info(
    { operationsCompleted: completedOperations.length },
    "Transaction completed successfully"
  );

  return {
    success: true,
    data: results as T,
    operationsCompleted: completedOperations.length,
  };
}

/**
 * Execute a transaction using Supabase RPC (if available)
 * Falls back to sequential execution with rollback
 */
export async function executeSupabaseTransaction<T = any>(
  operations: Array<() => Promise<any>>,
  rollbackOperations?: Array<(result: any) => Promise<void>>
): Promise<{ success: boolean; data?: T; error?: Error }> {
  // Supabase doesn't support client-side transactions directly
  // We'll use the executeTransaction function which provides
  // transaction-like behavior with rollback support
  const transactionOps: TransactionOperation[] = operations.map((op, i) => ({
    execute: op,
    rollback: rollbackOperations?.[i],
    description: `Operation ${i + 1}`,
  }));

  const result = await executeTransaction(transactionOps);

  return {
    success: result.success,
    data: result.data as T,
    error: result.error,
  };
}

/**
 * Helper to create a delete rollback operation
 */
export function createDeleteRollback(tableName: string, id: string) {
  return async () => {
    const { error } = await supabaseAdmin.from(tableName).delete().eq("id", id);
    if (error) {
      logger.error(
        { table: tableName, id, error: error.message },
        "Failed to rollback delete operation"
      );
      throw error;
    }
  };
}

/**
 * Helper to create an update rollback operation
 */
export function createUpdateRollback(
  tableName: string,
  id: string,
  originalData: Record<string, any>
) {
  return async () => {
    const { error } = await supabaseAdmin
      .from(tableName)
      .update(originalData)
      .eq("id", id);
    if (error) {
      logger.error(
        { table: tableName, id, error: error.message },
        "Failed to rollback update operation"
      );
      throw error;
    }
  };
}


