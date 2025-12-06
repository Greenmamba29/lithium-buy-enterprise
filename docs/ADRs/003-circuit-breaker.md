# ADR-003: Implementing Circuit Breaker Pattern for External Services

## Status
Accepted

## Context
External API calls (Daily.co, Perplexity, DocuSign, Gemini) can fail or become slow, causing cascading failures.

## Decision
Implemented circuit breaker pattern for all external service calls:
- Prevents cascading failures
- Provides automatic recovery
- Reduces load on failing services
- Improves user experience with graceful degradation

## Implementation
- Custom circuit breaker utility in `server/utils/circuitBreaker.ts`
- Applied to: Daily.co, Perplexity, DocuSign, Gemini services
- Configurable thresholds and reset timeouts

## Consequences
- Positive: System resilience, better error handling, improved UX
- Negative: Additional complexity, need to handle circuit open states
- Mitigation: Clear error messages, fallback strategies
