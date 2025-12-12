# Build Optimization Guide

This document outlines build optimization strategies, current optimizations, and best practices for the LithiumBuy Enterprise platform.

---

## Current Build Configuration

### Build Architecture

**Dual Build System:**
- **Client Build**: Vite 5.4 (Rollup-based)
- **Server Build**: esbuild 0.25 (Go-based, ultra-fast)

**Build Script Location**: `script/build.ts`

### Client Build (Vite)

#### Current Optimizations

**1. Code Splitting (Manual Chunks)**
```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
  'query-vendor': ['@tanstack/react-query'],
  'router-vendor': ['wouter'],
  'ui-vendor': ['@radix-ui/*'],
  'chart-vendor': ['recharts'],
  'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod']
}
```

**Benefits:**
- Vendors cached separately from app code
- Smaller initial bundle size
- Better browser caching (vendors change infrequently)
- Parallel chunk loading

**2. Minification**
- Using esbuild minifier (faster than Terser)
- CSS minification via PostCSS
- HTML minification via Vite

**3. Source Maps**
- Production: `hidden` (for debugging without exposing to users)
- Development: `true` (full source maps)

**4. Tree Shaking**
- Automatic via Vite/Rollup
- ES modules only (no CommonJS mixing)
- Side-effect-free packages marked in package.json

**5. Asset Optimization**
- Automatic asset inlining (< 4kb → base64)
- Asset hashing for cache busting
- Lazy loading routes with React.lazy()

#### Build Output Analysis

**Current Bundle Sizes** (approximate):
```
dist/public/
├── assets/
│   ├── react-vendor.[hash].js      (~140 KB gzipped)
│   ├── query-vendor.[hash].js      (~30 KB gzipped)
│   ├── ui-vendor.[hash].js         (~80 KB gzipped)
│   ├── chart-vendor.[hash].js      (~50 KB gzipped)
│   ├── form-vendor.[hash].js       (~20 KB gzipped)
│   ├── index.[hash].js             (~60 KB gzipped)
│   └── index.[hash].css            (~15 KB gzipped)
```

**Total Initial Load**: ~395 KB gzipped

### Server Build (esbuild)

#### Current Optimizations

**1. Dependency Bundling (Allowlist)**
```typescript
// Bundled dependencies (reduces syscalls)
allowlist = [
  "@google/generative-ai",
  "@neondatabase/serverless",
  "express",
  "drizzle-orm",
  "zod",
  // ... etc
]
```

**Benefits:**
- Reduced cold start time (fewer file system calls)
- Smaller node_modules footprint in production
- Faster module resolution

**2. Minification**
- Full JavaScript minification
- Dead code elimination
- Constant folding and inlining

**3. CommonJS Output**
- Format: `cjs` (CommonJS for Node.js compatibility)
- Platform: `node` (Node.js-specific optimizations)
- External dependencies (not bundled) loaded from node_modules

**4. Environment Variables**
- Hardcoded `NODE_ENV=production` at build time
- Enables production optimizations in dependencies

#### Build Output

```
dist/
├── index.cjs              (~500 KB minified, all bundled deps)
└── public/                (client build)
```

---

## Optimization Strategies

### 1. Frontend Optimizations

#### A. Lazy Loading & Code Splitting

**Current Implementation:**
```typescript
// App.tsx
const Home = lazy(() => import('@/pages/Home'));
const Auctions = lazy(() => import('@/pages/Auctions'));
```

**Recommendations:**
- ✅ Routes are lazy loaded
- ✅ Manual vendor chunks configured
- 🔄 Consider lazy loading heavy components (charts, rich text editors)
- 🔄 Implement route-based preloading on hover

**Example - Component Lazy Loading:**
```typescript
// Heavy chart component
const PriceChart = lazy(() => import('@/components/PriceChart'));

// In component
<Suspense fallback={<ChartSkeleton />}>
  <PriceChart data={data} />
</Suspense>
```

#### B. Image Optimization

**Current State:**
- ⚠️ No image optimization configured
- ⚠️ Images served directly from assets folder

**Recommendations:**
```typescript
// vite.config.ts additions
import imagemin from 'vite-plugin-imagemin';

plugins: [
  imagemin({
    gifsicle: { optimizationLevel: 7 },
    optipng: { optimizationLevel: 7 },
    mozjpeg: { quality: 80 },
    svgo: { plugins: [{ removeViewBox: false }] }
  })
]
```

**Best Practices:**
- Use WebP format with fallbacks
- Implement responsive images (srcset)
- Lazy load images below the fold
- Use placeholder blur technique

#### C. CSS Optimization

**Current Implementation:**
- ✅ Tailwind CSS with purging
- ✅ PostCSS with autoprefixer
- ✅ CSS minification

**Recommendations:**
- ✅ Already optimized via Tailwind purge
- 🔄 Consider CSS-in-JS for critical path CSS
- 🔄 Extract critical CSS for above-the-fold content

#### D. Bundle Size Analysis

**Install Rollup Visualizer:**
```bash
npm install -D rollup-plugin-visualizer
```

**Add to vite.config.ts:**
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  visualizer({
    filename: './dist/stats.html',
    open: true,
    gzipSize: true,
    brotliSize: true
  })
]
```

**Analyze After Build:**
```bash
npm run build
# Opens dist/stats.html automatically
```

### 2. Backend Optimizations

#### A. Reduce Bundle Size

**Current Bundled Dependencies:** 33 packages

**Review Checklist:**
- Remove unused dependencies from allowlist
- Check if dependencies can be replaced with lighter alternatives
- Verify all bundled deps are actually used

**Example Analysis:**
```bash
# Find unused dependencies
npx depcheck

# Analyze bundle composition
npx esbuild-visualizer dist/index.cjs
```

#### B. Database Query Optimization

**Best Practices:**
- Use `.select()` to fetch only needed columns
- Implement pagination for large datasets
- Add database indexes (already in migrations/002 and 011)
- Use connection pooling (Supabase handles this)

**Example - Optimized Query:**
```typescript
// ❌ Bad: Fetches all columns
const suppliers = await supabase.from('suppliers').select('*');

// ✅ Good: Fetch only needed columns
const suppliers = await supabase
  .from('suppliers')
  .select('id, name, verification_tier, logo_url')
  .range(0, 49); // Paginate
```

#### C. Caching Strategy

**Current Implementation:**
- TanStack Query client-side caching
- Service-layer caching (cacheService.ts)

**Recommendations:**
```typescript
// Add Redis caching for expensive queries
import { cacheService } from './services/cacheService';

export async function getSuppliers(filters) {
  const cacheKey = `suppliers:${JSON.stringify(filters)}`;

  // Try cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  // Fetch from database
  const data = await supabase.from('suppliers').select('*');

  // Cache for 5 minutes
  await cacheService.set(cacheKey, data, 300);

  return data;
}
```

#### D. WebSocket Optimization

**Best Practices:**
- Implement message batching
- Use binary protocols for large payloads
- Add connection pooling
- Implement heartbeat/ping-pong

**Example - Message Batching:**
```typescript
// Batch updates every 100ms instead of immediate
let updateQueue = [];
let batchTimer = null;

function queueUpdate(update) {
  updateQueue.push(update);

  if (!batchTimer) {
    batchTimer = setTimeout(() => {
      broadcastToChannel('updates', updateQueue);
      updateQueue = [];
      batchTimer = null;
    }, 100);
  }
}
```

### 3. Build Process Optimizations

#### A. Parallel Builds

**Current:** Sequential (client → server)

**Optimization:**
```typescript
// script/build.ts
async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building in parallel...");

  // Build both simultaneously
  await Promise.all([
    viteBuild(),
    buildServer()
  ]);
}
```

**Expected Speed Improvement:** 20-30% faster builds

#### B. Incremental Builds

**Development:**
- ✅ Vite HMR (Hot Module Replacement)
- ✅ tsx watch mode

**Production:**
- Consider caching build artifacts
- Use Turborepo for monorepo caching (future)

#### C. Build Caching

**Docker Builds:**
```dockerfile
# Cache node_modules
COPY package*.json ./
RUN npm ci --only=production

# Cache build dependencies
COPY tsconfig.json vite.config.ts ./
COPY client/ ./client/
RUN npm run build
```

**GitHub Actions:**
```yaml
- uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      dist
      node_modules
    key: ${{ runner.os }}-build-${{ hashFiles('**/package-lock.json') }}
```

---

## Performance Metrics

### Current Performance Targets

**Lighthouse Scores (Target):**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

**Core Web Vitals (Target):**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Bundle Size Limits:**
- Initial JS: < 400 KB gzipped
- Initial CSS: < 20 KB gzipped
- Vendor chunks: < 200 KB gzipped each

### Monitoring Build Size

**Add Size Limit:**
```bash
npm install -D size-limit @size-limit/file
```

**package.json:**
```json
"size-limit": [
  {
    "path": "dist/public/assets/*.js",
    "limit": "400 KB"
  },
  {
    "path": "dist/index.cjs",
    "limit": "600 KB"
  }
]
```

**CI Integration:**
```bash
npm run size-limit
```

---

## Build Commands

### Standard Build
```bash
npm run build              # Production build (client + server)
npm run check              # TypeScript type checking
npm run lint               # ESLint (no build)
```

### Advanced Build Options

**Clean Build:**
```bash
rm -rf dist node_modules/.vite
npm run build
```

**Build with Analysis:**
```bash
ANALYZE=true npm run build  # Generates bundle report
```

**Build Server Only:**
```bash
npx tsx script/build-server.ts  # Custom script needed
```

**Build Client Only:**
```bash
npm run build:client       # Add to package.json scripts
```

---

## Troubleshooting

### Common Build Issues

#### 1. Out of Memory Error
```bash
# Increase Node.js heap size
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### 2. Slow Build Times
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear npm cache
npm cache clean --force

# Rebuild
npm run build
```

#### 3. Large Bundle Size
```bash
# Analyze bundle composition
npm run build
# Check dist/stats.html (if visualizer configured)

# Find large dependencies
npx source-map-explorer dist/public/assets/*.js
```

#### 4. Type Errors During Build
```bash
# Run type check separately
npm run check

# Skip type check (not recommended)
vite build --mode production --no-types
```

---

## Future Optimizations

### Short-term (Next 1-3 months)
- [ ] Add bundle size monitoring (size-limit)
- [ ] Implement image optimization plugin
- [ ] Add parallel builds
- [ ] Configure route-based preloading
- [ ] Add Redis caching for API responses

### Medium-term (3-6 months)
- [ ] Migrate to Vite 6 (when stable)
- [ ] Implement Service Worker for offline support
- [ ] Add Web Workers for heavy computations
- [ ] Optimize font loading (FOUT prevention)
- [ ] Implement critical CSS extraction

### Long-term (6-12 months)
- [ ] Consider Remix/Next.js for SSR
- [ ] Implement edge caching (Cloudflare Workers)
- [ ] Add GraphQL for optimized data fetching
- [ ] Implement micro-frontends for large features
- [ ] Add E2E performance testing (Playwright)

---

## Recommended Tools

### Build Analysis
- **rollup-plugin-visualizer** - Bundle composition analysis
- **source-map-explorer** - Source map-based analysis
- **webpack-bundle-analyzer** - Alternative visualizer

### Performance Monitoring
- **Lighthouse CI** - Automated performance testing
- **WebPageTest** - Real-world performance testing
- **size-limit** - Bundle size limits in CI

### Development
- **vite-plugin-inspect** - Vite plugin inspection
- **tsx-watch** - Server watch mode with reload
- **concurrently** - Run dev servers in parallel

---

## Best Practices Checklist

### Before Every Release
- [ ] Run `npm run build` successfully
- [ ] Run `npm run check` (type checking)
- [ ] Run `npm test` (all tests pass)
- [ ] Check bundle size (< 400 KB gzipped)
- [ ] Test production build locally (`npm start`)
- [ ] Run Lighthouse audit (scores > 90)
- [ ] Verify source maps are hidden in production
- [ ] Check for console errors in production build

### Code Review Checklist
- [ ] No unnecessary dependencies added
- [ ] Heavy components are lazy loaded
- [ ] Images are optimized
- [ ] No console.logs in production code
- [ ] API responses are paginated
- [ ] Database queries are optimized (select specific columns)
- [ ] Caching is implemented for expensive operations

---

**Last Updated**: 2025-12-10

For questions or suggestions, please open an issue on GitHub or consult the team lead.
