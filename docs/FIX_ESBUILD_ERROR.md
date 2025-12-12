# Fix Netlify Deployment: esbuild Module Not Found Error

## Problem Summary

Netlify deployment is failing with the following error:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'esbuild' imported from /opt/build/repo/script/build.ts
```

## Root Cause

The build script (`script/build.ts`) imports `esbuild`, but when Netlify runs the build with `NODE_ENV=production` set in the build environment, npm may skip installing `devDependencies` where build tools were originally located.

## Solution Applied

### 1. Build Dependencies Moved to `dependencies`

The build-time dependencies required for the production build have been moved from `devDependencies` to `dependencies` in `package.json`:

- `esbuild` - Used for bundling the server
- `vite` - Used for building the client
- `tsx` - Used to execute TypeScript build scripts
- `typescript` - Required for TypeScript compilation
- `@vitejs/plugin-react` - Vite plugin for React
- `@tailwindcss/vite` - Tailwind CSS Vite plugin
- `postcss`, `tailwindcss`, `autoprefixer` - CSS processing tools

These are now in `dependencies` (lines 98-106) because they're required during the build phase, even in production.

### 2. Netlify Configuration Updated

Updated `netlify.toml` to:
- Remove `NODE_ENV=production` from the build environment (it was preventing dependency installation)
- Let Netlify install all dependencies during the build phase
- `NODE_ENV=production` will still be set at runtime, not during build

## Verification

After these changes, verify that:

1. **package.json** contains build tools in `dependencies`:
   ```bash
   grep -A 10 '"esbuild"\|"vite"\|"tsx"' package.json
   ```

2. **netlify.toml** doesn't set `NODE_ENV=production` during build:
   ```bash
   grep "NODE_ENV" netlify.toml
   ```

## Remaining Issue

**package-lock.json is still missing**, which can cause npm to resolve dependencies inconsistently. This is the underlying issue causing both errors:

1. The `@types/pino` error (resolved by fixing version in package.json)
2. The `esbuild` error (resolved by moving to dependencies and fixing Netlify config)

However, without a `package-lock.json`, npm may still have issues resolving the exact dependency tree. 

**Next step**: Generate and commit `package-lock.json` using the helper script:
```bash
./scripts/fix-netlify-lockfile.sh
```

## Files Modified

- `package.json` - Build dependencies moved to `dependencies` section
- `netlify.toml` - Removed `NODE_ENV=production` from build environment

## Related Issues

- See `docs/FIX_NETLIFY_DEPLOYMENT.md` for the `@types/pino` error fix
- Both issues stem from the missing `package-lock.json` file










