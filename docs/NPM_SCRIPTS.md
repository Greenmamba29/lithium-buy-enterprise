# NPM Scripts Documentation

> **Status**: 🚧 Documentation in Progress
>
> This document will contain comprehensive documentation for all NPM scripts used in the LithiumBuy Enterprise project.

## Overview

This project uses NPM scripts for various development, build, test, and deployment tasks. All scripts are defined in `package.json` under the `scripts` section.

---

## Current Scripts

### Development Scripts

#### `npm run dev`
**Command**: `NODE_ENV=development tsx server/index.ts`

**Purpose**: Start the development server with hot module replacement (HMR).

**Usage:**
```bash
npm run dev
```

**What it does:**
1. Sets NODE_ENV to development
2. Uses `tsx` to run TypeScript directly (no compilation)
3. Starts Express server on port 5000
4. Vite dev middleware provides HMR for client code
5. Server restarts on server code changes

**Access:**
- Frontend: http://localhost:5000
- API: http://localhost:5000/api

**Notes:**
- Requires `.env` file with necessary environment variables
- Port can be changed via PORT environment variable

---

### Build Scripts

#### `npm run build`
**Command**: `tsx script/build.ts`

**Purpose**: Build both client and server for production.

**Usage:**
```bash
npm run build
```

**What it does:**
1. Cleans `dist/` directory
2. Builds client with Vite → `dist/public/`
3. Builds server with esbuild → `dist/index.cjs`
4. Minifies and optimizes both builds

**Output:**
```
dist/
├── public/           # Client build (static assets)
└── index.cjs        # Server build (bundled)
```

**Build time**: ~10-15 seconds

---

#### `npm start`
**Command**: `NODE_ENV=production node dist/index.cjs`

**Purpose**: Start the production server.

**Usage:**
```bash
npm run build
npm start
```

**Requirements:**
- Must run `npm run build` first
- Production environment variables must be set

**Notes:**
- No HMR or auto-reload
- Serves static files from `dist/public/`
- API available at `/api/*`

---

### Type Checking

#### `npm run check`
**Command**: `tsc`

**Purpose**: Run TypeScript type checking without emitting files.

**Usage:**
```bash
npm run check
```

**What it does:**
- Checks all TypeScript files for type errors
- Uses tsconfig.json configuration
- Does not generate output files (noEmit: true)

**When to use:**
- Before committing code
- In CI/CD pipeline
- To verify type safety

---

### Database Scripts

#### `npm run db:push`
**Command**: `drizzle-kit push`

**Purpose**: Push Drizzle ORM schema changes to database.

**Status**: ⚠️ Legacy (migrating to Supabase-based migrations)

---

#### `npm run migrate`
**Command**: `tsx server/db/migrate.ts`

**Purpose**: Run database migrations using Supabase SQL files.

**Usage:**
```bash
npm run migrate
```

**What it does:**
1. Reads migration files from `server/db/migrations/`
2. Executes SQL migrations in order
3. Tracks applied migrations

**Migration files:**
```
server/db/migrations/
├── 001_initial_schema.sql
├── 002_indexes.sql
├── 003_rls_policies.sql
└── ...
```

---

#### `npm run create-admin`
**Command**: `tsx scripts/create-admin-user.ts`

**Purpose**: Create an admin user in the database.

**Usage:**
```bash
npm run create-admin
```

**What it does:**
1. Prompts for admin credentials
2. Creates user in Supabase Auth
3. Creates user profile with admin role
4. Displays created user details

**Requirements:**
- Supabase connection configured
- SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set

---

### Testing Scripts

#### `npm test`
**Command**: `vitest`

**Purpose**: Run tests with Vitest in watch mode.

**Usage:**
```bash
npm test                    # Watch mode
npm test -- --run          # Run once
npm test -- supplier.test.ts  # Run specific test
```

**What it does:**
- Runs all test files matching `**/*.test.{ts,tsx}`
- Watches for changes and re-runs tests
- Uses jsdom environment for React testing

**Test locations:**
```
server/__tests__/integration/
server/__tests__/unit/
server/routes/__tests__/
client/src/components/__tests__/
```

---

#### `npm run test:ui`
**Command**: `vitest --ui`

**Purpose**: Run Vitest with UI dashboard.

**Usage:**
```bash
npm run test:ui
```

**What it does:**
- Opens interactive test UI in browser
- Shows test results, coverage, and logs
- Allows filtering and debugging tests

**Access:** http://localhost:51204/__vitest__/

---

#### `npm run test:coverage`
**Command**: `vitest --coverage`

**Purpose**: Run tests and generate coverage report.

**Usage:**
```bash
npm run test:coverage
```

**Output:**
```
coverage/
├── lcov-report/index.html  # HTML report
├── lcov.info               # LCOV format
└── coverage-final.json     # JSON format
```

**View report:**
```bash
open coverage/lcov-report/index.html
```

---

### Linting Scripts

#### `npm run lint`
**Command**: `eslint . --ext .ts,.tsx`

**Purpose**: Run ESLint on all TypeScript files.

**Usage:**
```bash
npm run lint
```

**What it does:**
- Checks all `.ts` and `.tsx` files
- Reports errors and warnings
- Uses configuration from `.eslintrc.js`

**Exit codes:**
- 0: No errors
- 1: Errors found (blocks CI)
- 2: Warnings only

---

#### `npm run lint:fix`
**Command**: `eslint . --ext .ts,.tsx --fix`

**Purpose**: Run ESLint and auto-fix issues.

**Usage:**
```bash
npm run lint:fix
```

**What it does:**
- Fixes auto-fixable issues (formatting, simple errors)
- Reports remaining errors
- Modifies files in place

**Note:** Review changes before committing.

---

## Planned Scripts (Future)

### Build Scripts (Planned)
```json
{
  "build:client": "vite build",
  "build:server": "tsx script/build-server.ts",
  "build:analyze": "ANALYZE=true npm run build",
  "prebuild": "npm run clean:quick"
}
```

### Clean Scripts (Planned)
```json
{
  "clean": "bash scripts/clean.sh standard",
  "clean:quick": "bash scripts/clean.sh quick",
  "clean:cache": "bash scripts/clean.sh cache",
  "clean:deep": "bash scripts/clean.sh deep"
}
```

### Test Scripts (Planned)
```json
{
  "test:production": "bash scripts/test-production-build.sh",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

### Database Scripts (Planned)
```json
{
  "db:migrate:create": "tsx scripts/create-migration.ts",
  "db:migrate:up": "tsx server/db/migrate.ts up",
  "db:migrate:down": "tsx server/db/migrate.ts down",
  "db:seed": "tsx scripts/seed-database.ts"
}
```

### Deployment Scripts (Planned)
```json
{
  "deploy:staging": "bash scripts/deploy-staging.sh",
  "deploy:production": "bash scripts/deploy-production.sh",
  "predeploy": "npm run build && npm run test:production"
}
```

---

## Script Patterns

### Pre/Post Hooks
NPM automatically runs `pre*` and `post*` scripts:

**Example:**
```json
{
  "prebuild": "npm run clean",
  "build": "tsx script/build.ts",
  "postbuild": "npm run test:production"
}
```

Running `npm run build` executes:
1. `prebuild` (clean)
2. `build` (actual build)
3. `postbuild` (test)

### Environment Variables
Pass environment variables to scripts:

```bash
# Inline
NODE_ENV=production npm run build

# Using cross-env (cross-platform)
cross-env NODE_ENV=production npm run build
```

### Script Arguments
Pass arguments to scripts:

```bash
# After --
npm test -- --run --coverage

# Custom argument parsing in script
npm run migrate -- --version=005
```

### Parallel Execution
Run multiple scripts in parallel:

```bash
# Using npm-run-all
npm install -D npm-run-all
npm-run-all --parallel lint test build

# Using concurrently
npm install -D concurrently
concurrently "npm run dev:client" "npm run dev:server"
```

---

## Common Workflows

### Development Workflow
```bash
# Initial setup
npm install
cp .env.example .env
npm run migrate

# Daily development
npm run dev

# Before committing
npm run check
npm run lint
npm test -- --run
```

### Build & Deploy Workflow
```bash
# Prepare build
npm run clean
npm run check
npm run lint
npm test -- --run

# Build
npm run build

# Test production build
npm start  # In separate terminal, test manually

# Deploy
git push origin main  # Triggers CI/CD
```

### Troubleshooting Workflow
```bash
# Clean everything
npm run clean:deep  # (planned)

# Reinstall
npm install

# Verify setup
npm run check
npm test
npm run build
```

---

## Best Practices

### 1. Always Use NPM Scripts
✅ **Good:**
```bash
npm run build
npm test
npm run lint
```

❌ **Bad:**
```bash
vite build
vitest
eslint .
```

**Why:** Scripts ensure consistent configuration and can include pre/post hooks.

### 2. Check Before Committing
```bash
# Run this before every commit
npm run check && npm run lint && npm test -- --run
```

### 3. Use Correct Script for Context
- Development: `npm run dev`
- Production build: `npm run build` then `npm start`
- Type check: `npm run check` (faster than build)
- Auto-fix linting: `npm run lint:fix`

### 4. Read Script Output
Scripts provide valuable information:
- Build times
- Bundle sizes
- Test results
- Type errors
- Linting issues

---

## Troubleshooting

### Script Fails with "Command not found"
**Cause:** Dependency not installed

**Solution:**
```bash
npm install
```

### Script Fails with "Permission denied"
**Cause:** Script file not executable (bash scripts)

**Solution:**
```bash
chmod +x scripts/build.sh
```

### Build Fails with Memory Error
**Cause:** Insufficient Node.js heap memory

**Solution:**
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Test Fails to Start
**Cause:** Port already in use

**Solution:**
```bash
lsof -ti:5000 | xargs kill -9
npm run dev
```

---

## Related Documentation

- `/docs/BUILD_OPTIMIZATION.md` - Build optimization guide
- `/docs/TESTING.md` - Testing strategies
- `/docs/DEVELOPER_SETUP.md` - Initial setup
- `/CLAUDE.md` - Development patterns

---

## TODO: Complete Documentation

The following sections need to be completed:

- [ ] Add detailed examples for each script
- [ ] Document script configuration options
- [ ] Add performance benchmarks for build scripts
- [ ] Document CI/CD script integration
- [ ] Add debugging tips for each script
- [ ] Document custom script creation
- [ ] Add script chaining examples
- [ ] Document cross-platform considerations
- [ ] Add error code reference
- [ ] Complete planned scripts implementation

---

**Status**: 🚧 In Progress
**Last Updated**: 2025-12-10
**Next Steps**: Implement planned scripts and complete documentation

For questions or to request documentation updates, please open a GitHub issue.
