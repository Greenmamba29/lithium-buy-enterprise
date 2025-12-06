#!/bin/bash

# Netlify Deployment Script
# This script helps set up and deploy to Netlify

set -e

NETLIFY_AUTH_TOKEN="${NETLIFY_AUTH_TOKEN:-nfp_szVCaA8jFkxzYYStMvw75wwVtptg5fg57177}"

echo "🚀 Starting Netlify deployment setup..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Authenticate with Netlify
echo "🔐 Authenticating with Netlify..."
export NETLIFY_AUTH_TOKEN="$NETLIFY_AUTH_TOKEN"

# Initialize site (if not already initialized)
if [ ! -f ".netlify/state.json" ]; then
    echo "📦 Initializing Netlify site..."
    netlify init --manual
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
netlify deploy --prod --auth="$NETLIFY_AUTH_TOKEN"

echo "✅ Deployment complete!"
echo "📝 Don't forget to set environment variables in Netlify dashboard:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - SUPABASE_ANON_KEY"
echo "   - And other required variables from ENV_CONFIG.md"
