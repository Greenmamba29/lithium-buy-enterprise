# Build Test Skill

This skill tests the production build locally before deployment to catch issues early.

## What This Skill Does

Runs comprehensive tests on the production build to ensure:
- Build completes successfully
- Server starts without errors
- All routes are accessible
- API endpoints respond correctly
- Assets are served properly
- No runtime errors in production mode

## Usage

### Quick Test
Tests production build with basic checks.

### Full Test Suite
Runs comprehensive test suite including:
- Build verification
- Server startup test
- Route accessibility test
- API health checks
- Performance validation
- Error checking

## Test Steps

### 1. Clean Build
```bash
# Remove existing build artifacts
rm -rf dist node_modules/.vite

# Run production build
npm run build

# Verify build output
- ✅ dist/public/ contains client assets
- ✅ dist/index.cjs exists
- ✅ No build errors or warnings
- ✅ Source maps are hidden (not .map.js)
```

### 2. Server Startup Test
```bash
# Start production server
NODE_ENV=production node dist/index.cjs &
SERVER_PID=$!

# Wait for server to be ready
timeout 10s sh -c 'until curl -f http://localhost:5000/api/health; do sleep 1; done'

# Checks:
- ✅ Server starts without errors
- ✅ Listens on correct port (5000)
- ✅ Health endpoint responds
- ✅ No uncaught exceptions
```

### 3. Route Accessibility Test
```bash
# Test all main routes
curl -f http://localhost:5000/
curl -f http://localhost:5000/auctions
curl -f http://localhost:5000/rfq
curl -f http://localhost:5000/telebuy
curl -f http://localhost:5000/ai-studio
curl -f http://localhost:5000/admin/dashboard

# Checks:
- ✅ All routes return 200 OK
- ✅ HTML contains correct meta tags
- ✅ No 404 errors
- ✅ Assets load correctly
```

### 4. API Endpoint Tests
```bash
# Test critical API endpoints
curl -f http://localhost:5000/api/health
curl -f http://localhost:5000/api/suppliers?page=1
# ... other endpoints

# Checks:
- ✅ Endpoints return correct status codes
- ✅ Response format is valid JSON
- ✅ No server errors (500)
- ✅ Rate limiting works
- ✅ CORS headers present
```

### 5. Asset Loading Test
```bash
# Test static assets
curl -I http://localhost:5000/assets/index.[hash].js
curl -I http://localhost:5000/assets/index.[hash].css

# Checks:
- ✅ Assets return 200 OK
- ✅ Correct Content-Type headers
- ✅ Cache headers present
- ✅ Gzip/Brotli compression enabled
```

### 6. Performance Validation
```bash
# Measure key metrics
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- Total bundle size

# Checks:
- ✅ TTFB < 200ms (localhost)
- ✅ Initial bundle < 400 KB gzipped
- ✅ No blocking resources
- ✅ Lazy loaded routes don't block initial render
```

### 7. Error Checking
```bash
# Check for console errors
# Using headless browser or playwright

# Checks:
- ✅ No console errors on page load
- ✅ No unhandled promise rejections
- ✅ No React errors/warnings
- ✅ No 404s for assets
```

## Test Output

### Success Example
```markdown
## Production Build Test Results

**Build Status**: ✅ Success (12.3s)
**Server Status**: ✅ Running (PID: 12345)
**All Tests**: ✅ Passed (7/7)

### Test Results

#### 1. Build Verification ✅
- dist/public/: 8 files, 405 KB gzipped
- dist/index.cjs: 542 KB
- Build time: 12.3s
- No errors or warnings

#### 2. Server Startup ✅
- Started in 1.2s
- Listening on port 5000
- Health check: OK

#### 3. Route Accessibility ✅
- / → 200 OK (127ms)
- /auctions → 200 OK (85ms)
- /rfq → 200 OK (92ms)
- /telebuy → 200 OK (88ms)
- /ai-studio → 200 OK (95ms)
- /admin/dashboard → 200 OK (108ms)

#### 4. API Endpoints ✅
- /api/health → 200 OK
- /api/suppliers → 200 OK
- /api/auctions → 200 OK
- All endpoints responding correctly

#### 5. Asset Loading ✅
- All assets return 200 OK
- Compression: gzip enabled
- Cache headers: max-age=31536000

#### 6. Performance ✅
- TTFB: 45ms (target: < 200ms)
- Bundle size: 405 KB gzipped (target: < 400 KB)
- No blocking resources detected

#### 7. Error Checking ✅
- No console errors
- No unhandled rejections
- No React warnings
- No 404s

### Summary
✅ Production build is ready for deployment
```

### Failure Example
```markdown
## Production Build Test Results

**Build Status**: ❌ Failed
**Server Status**: ❌ Not Started
**All Tests**: ❌ Failed (2/7 passed)

### Test Results

#### 1. Build Verification ❌
- Error: TypeScript compilation failed
- server/services/auctionService.ts:45:12
  - Type 'string' is not assignable to type 'number'
- Fix required before deployment

#### 2. Server Startup ❌
- Server failed to start
- Error: Cannot find module '@supabase/supabase-js'
- Possible cause: Missing dependency in production

#### 3. Route Accessibility ⏭️
- Skipped (server not running)

### Issues Detected

🔴 **Critical Issues** (Must fix before deployment)
1. TypeScript compilation error in auctionService.ts
2. Missing production dependency (@supabase/supabase-js)

### Recommended Actions
1. Fix TypeScript errors: npm run check
2. Verify production dependencies: npm ci --only=production
3. Re-run tests after fixes
```

## Automated Testing Script

### Create Test Script
```bash
# scripts/test-production-build.sh
#!/bin/bash

set -e

echo "🧹 Cleaning build artifacts..."
rm -rf dist node_modules/.vite

echo "🏗️  Building for production..."
npm run build

echo "🚀 Starting production server..."
NODE_ENV=production node dist/index.cjs &
SERVER_PID=$!

# Cleanup on exit
trap "kill $SERVER_PID" EXIT

echo "⏳ Waiting for server to be ready..."
timeout 30s sh -c 'until curl -f http://localhost:5000/api/health; do sleep 1; done'

echo "✅ Running test suite..."

# Run tests
npm run test:e2e:production

echo "✅ All tests passed!"
```

### Add to package.json
```json
{
  "scripts": {
    "test:production": "bash scripts/test-production-build.sh"
  }
}
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Test Production Build

on: [pull_request]

jobs:
  test-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:production
      - name: Upload build artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: failed-build
          path: dist/
```

## Success Criteria

Production build is ready when:
- [ ] Build completes without errors
- [ ] Server starts successfully
- [ ] All routes return 200 OK
- [ ] API endpoints respond correctly
- [ ] Assets load without 404s
- [ ] No console errors detected
- [ ] Performance metrics within targets
- [ ] No TypeScript errors
- [ ] No ESLint errors

## Common Issues & Solutions

### Issue: Server fails to start
**Symptoms**: "Cannot find module" error
**Solution**: Check that all dependencies are in `dependencies` (not `devDependencies`)

### Issue: Routes return 404
**Symptoms**: Client-side routes not working
**Solution**: Verify static file serving is configured correctly in server/index.ts

### Issue: Assets not loading
**Symptoms**: 404 for .js/.css files
**Solution**: Check vite.config.ts `build.outDir` matches server static path

### Issue: High memory usage
**Symptoms**: Server crashes with OOM
**Solution**: Increase Node heap size: `NODE_OPTIONS="--max-old-space-size=4096" node dist/index.cjs`

## Related Skills

- `build-optimize.md` - Optimize build before testing
- `build-analyze.md` - Analyze build artifacts
- `build-clean.md` - Clean build artifacts

## Related Documentation

- `/docs/BUILD_OPTIMIZATION.md` - Build optimization guide
- `/docs/TESTING.md` - Testing strategies
- `/docs/DEPLOYMENT.md` - Deployment procedures
