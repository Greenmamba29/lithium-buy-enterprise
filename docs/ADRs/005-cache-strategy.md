# ADR-005: Multi-Tier Cache Fallback Strategy

## Status
Accepted

## Context
Redis may be unavailable, but we still want caching benefits.

## Decision
Implemented multi-tier cache strategy:
1. **Redis** (primary) - Distributed, persistent
2. **In-memory** (fallback) - Fast, local to instance
3. **Database** (last resort) - Always available

## Implementation
- Cache service checks Redis first
- Falls back to in-memory Map if Redis fails
- Can fall back to database queries if needed
- Automatic cache warming on startup

## Consequences
- Positive: High availability, graceful degradation
- Negative: More complex cache invalidation
- Mitigation: Clear cache key strategy, TTL management
