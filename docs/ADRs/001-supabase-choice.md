# ADR-001: Choosing Supabase as Database Solution

## Status
Accepted

## Context
We needed a PostgreSQL database solution that provides:
- Serverless/cloud hosting
- Row Level Security (RLS)
- Real-time capabilities
- Easy authentication
- REST API out of the box
- TypeScript support

## Decision
We chose Supabase over alternatives (Neon, Railway, AWS RDS) because:
1. Built-in RLS policies for security
2. Real-time subscriptions for WebSocket features
3. Integrated authentication
4. Free tier suitable for development
5. Excellent TypeScript support
6. Active community and documentation

## Consequences
- Positive: Fast development, built-in security, real-time features
- Negative: Vendor lock-in, potential cost at scale
- Mitigation: Use abstraction layer for database access
