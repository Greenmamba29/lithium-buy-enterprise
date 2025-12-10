# Build Clean Skill

This skill thoroughly cleans build artifacts, caches, and temporary files to ensure a fresh build environment.

## What This Skill Does

Removes all build-related files and caches including:
- Build output directories
- Vite cache
- Node modules cache
- TypeScript cache
- ESLint cache
- Test coverage reports
- Temporary files

## Usage

### Quick Clean
Removes only build output (dist/).

### Standard Clean
Removes build output + Vite cache.

### Deep Clean
Removes everything including node_modules (requires reinstall).

### Cache-Only Clean
Removes only cache files, keeps build output.

## Clean Levels

### Level 1: Quick Clean (Default)
```bash
# Removes:
- dist/                  # Build output
- dist/public/          # Client build
- dist/index.cjs        # Server build

# Preserves:
- node_modules/.vite/   # Vite cache
- node_modules/         # Dependencies
- .eslintcache         # ESLint cache

# Use when:
- Rebuilding after code changes
- Testing build configuration changes
- Before deployment
```

### Level 2: Standard Clean
```bash
# Removes:
- dist/                 # Build output
- node_modules/.vite/  # Vite cache
- .vite/               # Vite config cache
- .tsbuildinfo         # TypeScript cache

# Preserves:
- node_modules/        # Dependencies

# Use when:
- Build errors persist after quick clean
- Vite showing stale content
- TypeScript errors don't match code
```

### Level 3: Cache Clean
```bash
# Removes:
- node_modules/.vite/  # Vite cache
- node_modules/.cache/ # Various caches
- .eslintcache         # ESLint cache
- .tsbuildinfo         # TypeScript cache
- coverage/            # Test coverage
- .turbo/              # Turbo cache (if using)

# Preserves:
- dist/                # Build output
- node_modules/        # Dependencies

# Use when:
- Cache-related issues
- Linting showing wrong results
- Type checking issues
```

### Level 4: Deep Clean
```bash
# Removes:
- dist/                # Build output
- node_modules/        # All dependencies
- package-lock.json    # Lock file
- All cache files

# Requires:
- npm install          # Reinstall dependencies

# Use when:
- Dependency conflicts
- Corrupted node_modules
- Major version upgrades
- Switching branches with different dependencies
```

## Clean Commands

### Quick Clean
```bash
rm -rf dist
```

### Standard Clean
```bash
rm -rf dist node_modules/.vite .vite .tsbuildinfo
```

### Cache Clean
```bash
rm -rf node_modules/.vite \
       node_modules/.cache \
       .eslintcache \
       .tsbuildinfo \
       coverage \
       .turbo
```

### Deep Clean
```bash
rm -rf dist \
       node_modules \
       package-lock.json \
       node_modules/.vite \
       .eslintcache \
       .tsbuildinfo \
       coverage

npm install
```

### Nuclear Clean (Complete Reset)
```bash
# WARNING: This removes EVERYTHING except source code
rm -rf dist \
       node_modules \
       package-lock.json \
       .vite \
       .eslintcache \
       .tsbuildinfo \
       coverage \
       .turbo \
       .next \
       .cache

npm cache clean --force
npm install
```

## Clean Script

### Create Clean Script
```bash
# scripts/clean.sh
#!/bin/bash

LEVEL=${1:-standard}

case $LEVEL in
  quick)
    echo "🧹 Quick clean: Removing build output..."
    rm -rf dist
    echo "✅ Done!"
    ;;

  standard)
    echo "🧹 Standard clean: Removing build output and caches..."
    rm -rf dist node_modules/.vite .vite .tsbuildinfo
    echo "✅ Done!"
    ;;

  cache)
    echo "🧹 Cache clean: Removing all caches..."
    rm -rf node_modules/.vite \
           node_modules/.cache \
           .eslintcache \
           .tsbuildinfo \
           coverage
    echo "✅ Done!"
    ;;

  deep)
    echo "🧹 Deep clean: Removing everything..."
    rm -rf dist \
           node_modules \
           package-lock.json \
           .vite \
           .eslintcache \
           .tsbuildinfo \
           coverage
    echo "📦 Reinstalling dependencies..."
    npm install
    echo "✅ Done!"
    ;;

  nuclear)
    read -p "⚠️  This will delete EVERYTHING. Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      echo "☢️  Nuclear clean: Removing everything..."
      rm -rf dist \
             node_modules \
             package-lock.json \
             .vite \
             .eslintcache \
             .tsbuildinfo \
             coverage \
             .turbo \
             .cache
      npm cache clean --force
      echo "📦 Reinstalling dependencies..."
      npm install
      echo "✅ Done!"
    else
      echo "❌ Cancelled"
    fi
    ;;

  *)
    echo "Usage: ./scripts/clean.sh [quick|standard|cache|deep|nuclear]"
    exit 1
    ;;
esac
```

### Make Executable
```bash
chmod +x scripts/clean.sh
```

### Add to package.json
```json
{
  "scripts": {
    "clean": "bash scripts/clean.sh standard",
    "clean:quick": "bash scripts/clean.sh quick",
    "clean:cache": "bash scripts/clean.sh cache",
    "clean:deep": "bash scripts/clean.sh deep",
    "prebuild": "npm run clean:quick"
  }
}
```

## Usage Examples

### Before Building
```bash
npm run clean        # Standard clean
npm run build       # Fresh build
```

### Fix Cache Issues
```bash
npm run clean:cache  # Clear all caches
npm run dev         # Restart dev server
```

### Fix Dependency Issues
```bash
npm run clean:deep   # Remove and reinstall everything
npm run build       # Test build
```

### Automated Pre-build Clean
```json
{
  "scripts": {
    "prebuild": "npm run clean:quick"
  }
}
```
Now `npm run build` automatically cleans first.

## What Gets Removed

### Build Output (`dist/`)
```
dist/
├── public/                    # Client build
│   ├── index.html
│   ├── assets/
│   │   ├── index.[hash].js
│   │   ├── index.[hash].css
│   │   └── *.vendor.[hash].js
│   └── favicon.ico
└── index.cjs                  # Server build
```

### Vite Cache (`node_modules/.vite/`)
```
node_modules/.vite/
├── deps/                      # Pre-bundled dependencies
├── deps_temp/                 # Temporary optimization files
└── _metadata.json            # Cache metadata
```

### TypeScript Cache
```
.tsbuildinfo                   # TypeScript incremental build info
```

### ESLint Cache
```
.eslintcache                   # ESLint cache file
```

### Test Coverage
```
coverage/
├── lcov-report/              # HTML coverage report
├── lcov.info                 # LCOV format
└── coverage-final.json       # JSON format
```

## Troubleshooting

### Issue: "Cannot remove dist: Permission denied"
**Solution:**
```bash
sudo rm -rf dist
# Or check if a process is using files in dist:
lsof +D dist
```

### Issue: Clean doesn't fix build errors
**Try in order:**
1. Standard clean + rebuild
2. Cache clean + rebuild
3. Deep clean + rebuild
4. Check for code errors (npm run check)

### Issue: "npm install fails after deep clean"
**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete package-lock.json and try again
rm package-lock.json
npm install

# Use npm ci instead (requires package-lock.json)
npm ci
```

### Issue: Disk space not freed after clean
**Check:**
```bash
# Find large files
du -sh dist node_modules .vite coverage

# Check npm cache
du -sh ~/.npm

# Clean npm cache
npm cache clean --force
```

## Disk Space Savings

### Typical Sizes (LithiumBuy Enterprise)
```
dist/              ~3 MB    (build output)
node_modules/      ~500 MB  (dependencies)
.vite/            ~50 MB   (Vite cache)
coverage/         ~5 MB    (test coverage)
.eslintcache      ~1 MB    (ESLint cache)
```

### Expected Savings
- Quick Clean: ~3 MB
- Standard Clean: ~53 MB
- Cache Clean: ~56 MB
- Deep Clean: ~560 MB

## Best Practices

### When to Clean

**Always Clean:**
- Before production build
- Before major version upgrades
- When switching to different branch with different dependencies
- After dependency conflicts

**Sometimes Clean:**
- When build behaves unexpectedly
- When cache seems stale
- Before performance testing
- After failed builds

**Rarely Clean:**
- During active development (slows down workflow)
- When everything works fine

### Clean Checklist

Before cleaning:
- [ ] Commit or stash changes
- [ ] Close dev server
- [ ] Close editor (if using with file watchers)
- [ ] Note current working state

After cleaning:
- [ ] Verify clean completed successfully
- [ ] Reinstall dependencies (if deep clean)
- [ ] Run type check (npm run check)
- [ ] Run tests (npm test)
- [ ] Rebuild (npm run build)

## Automated Cleaning

### Git Hooks (Optional)
```bash
# .husky/post-checkout
#!/bin/bash
# Auto-clean when switching branches

# Only clean if package.json changed
if git diff --name-only HEAD@{1} HEAD | grep -q "package.json"; then
  echo "📦 package.json changed, running clean..."
  npm run clean:cache
fi
```

### CI/CD Integration
```yaml
# .github/workflows/ci.yml
jobs:
  build:
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Clean build
        run: npm run clean
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
```

## Success Criteria

Clean is successful when:
- [ ] Target directories are removed
- [ ] No errors during cleanup
- [ ] Subsequent build succeeds
- [ ] Dev server starts without issues
- [ ] Type checking passes
- [ ] Tests still pass

## Related Skills

- `build-optimize.md` - Optimize after cleaning
- `build-analyze.md` - Analyze build artifacts
- `build-test.md` - Test after cleaning

## Related Documentation

- `/docs/BUILD_OPTIMIZATION.md` - Build optimization guide
- `/docs/TROUBLESHOOTING.md` - Troubleshooting build issues
