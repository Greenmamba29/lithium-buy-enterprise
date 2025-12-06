# ADR-006: Custom Transaction Management for Supabase

## Status
Accepted

## Context
Supabase doesn't support traditional database transactions via client. Need atomic operations for multi-table operations.

## Decision
Created custom transaction wrapper (`server/utils/transactions.ts`) that:
- Executes operations in sequence
- Provides rollback capability
- Logs all operations
- Ensures data consistency

## Implementation
- `executeTransaction()` function
- Rollback helpers for delete/update operations
- Used for: supplier creation, quote acceptance, RFQ awarding

## Consequences
- Positive: Data consistency, atomic operations
- Negative: Not true database transactions, manual rollback
- Mitigation: Comprehensive testing, clear error handling
