# Build Optimization Skill

This skill helps optimize the build process for the LithiumBuy Enterprise application.

## What This Skill Does

1. Analyzes current build configuration
2. Identifies optimization opportunities
3. Provides actionable recommendations
4. Can apply optimizations automatically with user approval

## Usage

When invoked, this skill will:

### 1. Analyze Build Configuration
- Check `vite.config.ts` for client build settings
- Review `script/build.ts` for build orchestration
- Analyze `package.json` for dependencies
- Review Tailwind CSS configuration for purge settings

### 2. Check Bundle Sizes
- Run production build
- Measure gzipped bundle sizes
- Compare against recommended limits:
  - Initial JS: < 400 KB gzipped
  - Initial CSS: < 20 KB gzipped
  - Vendor chunks: < 200 KB each
  - Server bundle: < 600 KB

### 3. Identify Issues
- Oversized bundles
- Duplicate dependencies
- Missing code splitting
- Unoptimized images
- Missing lazy loading
- Inefficient vendor chunks

### 4. Recommend Optimizations
Based on analysis, suggest:
- Additional manual chunks
- Dependencies to lazy load
- Images to optimize
- Heavy components to split
- Caching strategies

### 5. Apply Optimizations (Optional)
With user approval, can:
- Update Vite configuration
- Add lazy loading to heavy components
- Configure bundle analysis plugins
- Update build scripts

## Example Workflow

```bash
# User invokes this skill
# Skill performs analysis and shows:

## Build Analysis Results

### Current Bundle Sizes
- react-vendor.js: 142 KB gzipped ✅
- ui-vendor.js: 95 KB gzipped ⚠️ (recommended: < 80 KB)
- index.js: 68 KB gzipped ✅
- Total: 405 KB gzipped ⚠️ (recommended: < 400 KB)

### Optimization Opportunities

1. **Large UI Vendor Chunk** (Priority: High)
   - Current: 95 KB gzipped
   - Issue: Too many Radix UI components bundled together
   - Solution: Split into separate chunks by feature

2. **Recharts Not Lazy Loaded** (Priority: Medium)
   - Location: client/src/pages/admin/Dashboard.tsx
   - Impact: 50 KB added to initial bundle
   - Solution: Lazy load chart components

3. **Images Not Optimized** (Priority: Medium)
   - Found: 15 unoptimized PNG/JPG files in attached_assets/
   - Impact: ~2 MB additional transfer
   - Solution: Convert to WebP, add image optimization plugin

### Recommended Actions

Would you like me to:
1. Split UI vendor chunk into smaller chunks?
2. Add lazy loading to chart components?
3. Install and configure image optimization plugin?
4. All of the above?
```

## Implementation Tasks

When user approves optimizations, this skill will:

### Task 1: Optimize Vendor Chunks
```typescript
// Update vite.config.ts
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'query-vendor': ['@tanstack/react-query'],
  'ui-core-vendor': [
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu'
  ],
  'ui-forms-vendor': [
    '@radix-ui/react-select',
    '@radix-ui/react-tabs'
  ],
  'chart-vendor': ['recharts']
}
```

### Task 2: Add Lazy Loading
```typescript
// Update Dashboard.tsx
const PriceChart = lazy(() => import('@/components/charts/PriceChart'));
const UsageChart = lazy(() => import('@/components/charts/UsageChart'));
```

### Task 3: Configure Image Optimization
```bash
npm install -D vite-plugin-imagemin
```

```typescript
// Add to vite.config.ts
import imagemin from 'vite-plugin-imagemin';

plugins: [
  imagemin({
    gifsicle: { optimizationLevel: 7 },
    optipng: { optimizationLevel: 7 },
    mozjpeg: { quality: 80 }
  })
]
```

## Success Criteria

After optimizations:
- [ ] Total initial bundle < 400 KB gzipped
- [ ] No single vendor chunk > 80 KB gzipped
- [ ] Heavy components are lazy loaded
- [ ] Images are optimized
- [ ] Build time improved by 10-20%
- [ ] Lighthouse performance score > 90

## Related Documentation

- `/docs/BUILD_OPTIMIZATION.md` - Detailed build optimization guide
- `/script/build.ts` - Build orchestration script
- `/vite.config.ts` - Vite configuration
- `/CLAUDE.md` - AI assistant guide with build patterns
