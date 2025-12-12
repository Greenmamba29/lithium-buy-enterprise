# Build Analysis Skill

This skill analyzes the production build and provides detailed insights into bundle composition, size, and performance characteristics.

## What This Skill Does

Performs comprehensive build analysis including:
- Bundle size measurement
- Dependency analysis
- Code splitting effectiveness
- Performance metrics
- Optimization recommendations

## Usage

### Quick Analysis (No Build)
Analyzes existing build artifacts in `dist/` directory.

### Full Analysis (With Build)
1. Runs clean production build
2. Measures build time
3. Analyzes bundle composition
4. Generates visual reports
5. Provides optimization recommendations

## Analysis Steps

### 1. Build Metrics
```bash
# Measures:
- Total build time
- Client build time
- Server build time
- Number of chunks generated
- Total bundle size (uncompressed)
- Total bundle size (gzipped)
- Total bundle size (brotli)
```

### 2. Bundle Breakdown
```bash
# Analyzes each chunk:
dist/public/assets/
├── react-vendor.[hash].js
│   ├── Size: 142 KB gzipped
│   ├── Modules: react, react-dom, react/jsx-runtime
│   └── Status: ✅ Within limits
├── query-vendor.[hash].js
│   ├── Size: 32 KB gzipped
│   ├── Modules: @tanstack/react-query
│   └── Status: ✅ Within limits
└── index.[hash].js
    ├── Size: 68 KB gzipped
    ├── Contains: Application code
    └── Status: ✅ Within limits
```

### 3. Dependency Analysis
```bash
# Checks for:
- Duplicate dependencies (same package, different versions)
- Unused dependencies (in package.json but not imported)
- Heavy dependencies (> 50 KB)
- Opportunities to switch to lighter alternatives
```

### 4. Code Splitting Analysis
```bash
# Evaluates:
- Number of lazy loaded routes
- Components that should be lazy loaded
- Vendor chunk effectiveness
- Dynamic import usage
```

### 5. Performance Predictions
```bash
# Estimates:
- First Load JS (Initial bundle size)
- Time to Interactive (based on bundle size + parsing time)
- Largest Contentful Paint estimate
- Cache hit rate (vendor vs app code)
```

## Output Format

### Summary Report
```markdown
## Build Analysis Summary

**Build Completed**: ✅ Success
**Build Time**: 12.3 seconds
**Total Bundles**: 8 chunks

### Bundle Sizes
| Chunk | Size (gzip) | Size (brotli) | Status |
|-------|-------------|---------------|--------|
| react-vendor | 142 KB | 125 KB | ✅ OK |
| ui-vendor | 95 KB | 82 KB | ⚠️ Large |
| index | 68 KB | 58 KB | ✅ OK |
| **TOTAL** | **405 KB** | **350 KB** | ⚠️ Near Limit |

### Performance Metrics
- **First Load JS**: 405 KB (⚠️ Target: < 400 KB)
- **Estimated TTI**: 2.1s (✅ Target: < 3s)
- **Cache Efficiency**: 65% (✅ Good)

### Issues Found
1. ⚠️ **UI Vendor Chunk Too Large** (95 KB)
   - Recommendation: Split into ui-core and ui-forms chunks
   - Expected Impact: -15 KB gzipped

2. ⚠️ **Recharts Not Lazy Loaded** (50 KB)
   - Location: admin/Dashboard.tsx, pages/Analytics.tsx
   - Recommendation: Lazy load chart components
   - Expected Impact: -50 KB from initial bundle

3. ℹ️ **Lodash Included** (24 KB)
   - Location: Multiple files using full lodash import
   - Recommendation: Use lodash-es or individual imports
   - Expected Impact: -15 KB gzipped

### Quick Wins (Total Impact: -80 KB)
- [ ] Split UI vendor chunk → -15 KB
- [ ] Lazy load Recharts → -50 KB
- [ ] Use lodash-es → -15 KB
```

### Detailed Report (Optional)
When requested, generates:
- HTML visualization (using rollup-plugin-visualizer)
- Module-by-module breakdown
- Dependency tree
- Import analysis

## Commands Used

### Install Analysis Tools (First Time)
```bash
npm install -D rollup-plugin-visualizer source-map-explorer size-limit
```

### Run Analysis
```bash
# Clean build with analysis
rm -rf dist
ANALYZE=true npm run build

# Analyze existing build
npx source-map-explorer 'dist/public/assets/*.js' --html > analysis.html

# Check against size limits
npx size-limit
```

### Generate Reports
```bash
# Bundle visualizer (auto-opens in browser)
# Configured in vite.config.ts when ANALYZE=true

# Size limit report
npx size-limit --json > size-report.json
```

## Integration with CI/CD

This skill can be automated in CI/CD pipelines:

```yaml
# .github/workflows/analyze-build.yml
name: Build Analysis

on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: ANALYZE=true npm run build
      - run: npx size-limit
      - name: Comment PR with analysis
        uses: actions/github-script@v6
        # ... post results to PR
```

## Success Criteria

Analysis is successful when:
- [ ] Build completes without errors
- [ ] All chunks are within size limits
- [ ] No duplicate dependencies detected
- [ ] Heavy components are lazy loaded
- [ ] Cache efficiency > 60%
- [ ] No unused dependencies found

## Related Skills

- `build-optimize.md` - Apply optimizations based on this analysis
- `build-test.md` - Test production build locally
- `build-clean.md` - Clean build artifacts and caches

## Related Documentation

- `/docs/BUILD_OPTIMIZATION.md` - Build optimization strategies
- `/docs/PERFORMANCE.md` - Performance guidelines
