#!/bin/bash
#
# Script to fix Netlify deployment by generating package-lock.json
# Run this script when npm is available in your environment
#
# Usage: ./scripts/fix-netlify-lockfile.sh

set -e

echo "🔧 Fixing Netlify deployment: Generating package-lock.json"
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm is not available in your PATH"
    echo ""
    echo "Please install Node.js with npm, then run this script again."
    echo ""
    echo "You can install Node.js via:"
    echo "  - Homebrew: brew install node"
    echo "  - nvm: nvm install 20 && nvm use 20"
    echo "  - Official installer: https://nodejs.org/"
    echo ""
    exit 1
fi

# Check Node version
NODE_VERSION=$(node --version)
echo "✓ Node.js version: $NODE_VERSION"
NPM_VERSION=$(npm --version)
echo "✓ npm version: $NPM_VERSION"
echo ""

# Verify package.json has correct @types/pino version
if ! grep -q '"@types/pino": "^7.0.5"' package.json; then
    echo "⚠️  WARNING: package.json does not contain @types/pino@^7.0.5"
    echo "   Please verify package.json is correct before proceeding"
    echo ""
fi

# Remove old lockfile if it exists
if [ -f "package-lock.json" ]; then
    echo "🗑️  Removing existing package-lock.json..."
    rm package-lock.json
fi

# Generate new package-lock.json
echo "📦 Installing dependencies to generate package-lock.json..."
echo "   This may take a few minutes..."
npm install

# Verify @types/pino version in lockfile
echo ""
echo "🔍 Verifying @types/pino version in package-lock.json..."

if grep -q '"@types/pino".*"8\.17\.1"' package-lock.json 2>/dev/null; then
    echo "❌ ERROR: package-lock.json still contains invalid @types/pino@8.17.1"
    echo "   Please check package.json and try again"
    exit 1
fi

if grep -q '"@types/pino".*"7\.' package-lock.json 2>/dev/null; then
    echo "✓ SUCCESS: package-lock.json contains @types/pino version 7.x.x"
else
    echo "⚠️  WARNING: Could not verify @types/pino version in lockfile"
    echo "   Please check package-lock.json manually"
fi

echo ""
echo "✅ Package-lock.json generated successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Review the generated package-lock.json"
echo "   2. Stage the file: git add package-lock.json"
echo "   3. Commit: git commit -m 'fix: add package-lock.json with correct @types/pino resolution'"
echo "   4. Push: git push"
echo ""
echo "This will trigger a new Netlify build with the correct dependencies."










