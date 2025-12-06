# ADR-004: Using BullMQ for Background Job Processing

## Status
Accepted

## Context
Need background job processing for:
- Email sending
- Data synchronization
- Post-call automation
- Market intelligence updates

## Decision
Chose BullMQ over alternatives (Agenda, Bull, Kue) because:
1. Built on Redis (we already use Upstash)
2. TypeScript support
3. Job prioritization and scheduling
4. Retry mechanisms
5. Job progress tracking
6. Active development and good documentation

## Consequences
- Positive: Reliable job processing, scalable, feature-rich
- Negative: Requires Redis, additional infrastructure
- Mitigation: Upstash free tier sufficient for development
