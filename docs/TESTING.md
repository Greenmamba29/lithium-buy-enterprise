# Testing Guide

## Test Structure

```
server/
├── __tests__/
│   ├── integration/     # Integration tests
│   └── unit/            # Unit tests
client/
└── src/
    └── components/
        └── __tests__/   # Component tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

## Test Types

### Unit Tests
- Test individual functions and utilities
- Mock external dependencies
- Fast execution

### Integration Tests
- Test complete flows
- Use test database
- Test API endpoints

### Component Tests
- Test React components
- Use React Testing Library
- Test user interactions

## Writing Tests

### Example Unit Test
```typescript
import { describe, it, expect } from 'vitest';
import { calculateScore } from '../utils/scoring';

describe('calculateScore', () => {
  it('should calculate correct score', () => {
    const result = calculateScore({ price: 100, rating: 4.5 });
    expect(result).toBe(85);
  });
});
```

### Example Integration Test
```typescript
import { describe, it, expect } from 'vitest';
import { createSupplier } from '../services/supplierService';

describe('Supplier Creation Flow', () => {
  it('should create supplier with profile', async () => {
    const supplier = await createSupplier({...});
    expect(supplier.id).toBeDefined();
  });
});
```

## Test Database

- Use separate Supabase project for testing
- Reset database between test runs
- Use transactions for cleanup

## Mocking

### External APIs
- Mock Daily.co API calls
- Mock Perplexity API calls
- Use MSW (Mock Service Worker) for HTTP mocking

### Database
- Use test database
- Seed test data
- Clean up after tests

## Coverage Goals

- Unit tests: 80%+ coverage
- Integration tests: Critical flows covered
- Component tests: User-facing components
