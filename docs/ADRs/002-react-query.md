# ADR-002: Using TanStack Query for Server State Management

## Status
Accepted

## Context
We needed a solution for managing server state, caching, and data synchronization. Options considered:
- Redux Toolkit
- Zustand
- SWR
- TanStack Query (React Query)

## Decision
Chose TanStack Query v5 because:
1. Built-in caching and background refetching
2. Automatic request deduplication
3. Optimistic updates support
4. Excellent TypeScript support
5. DevTools for debugging
6. Minimal boilerplate compared to Redux

## Consequences
- Positive: Reduced state management complexity, automatic caching, better UX
- Negative: Learning curve for team members new to React Query
- Mitigation: Comprehensive documentation and examples
