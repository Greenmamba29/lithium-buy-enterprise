#!/bin/bash
# Complete Netlify Deployment - Run this on your local machine

set -e

echo "🚀 LithiumBuy Enterprise - Complete Netlify Deployment"
echo "========================================================"

# Set your token
export NETLIFY_AUTH_TOKEN="nfp_hnAeCG6pRU5LuPsBv5AZB71HLMZHPfHwc3ff"

# Get site ID
echo "📋 Fetching your Netlify sites..."
SITE_ID=$(netlify sites:list --json | jq -r '.[0].id')

if [ -z "$SITE_ID" ]; then
    echo "❌ No sites found. Please link your site first:"
    echo "   netlify link"
    exit 1
fi

echo "✅ Found site: $SITE_ID"

# Set environment variables
echo ""
echo "🔧 Setting environment variables..."

netlify env:set NODE_ENV "production" --site-id "$SITE_ID"
echo "  ✓ NODE_ENV=production"

netlify env:set PORT "8888" --site-id "$SITE_ID"
echo "  ✓ PORT=8888"

# Verify Supabase vars are set
echo ""
echo "📝 Verifying Supabase environment variables..."
netlify env:list --site-id "$SITE_ID" | grep -E "SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY" || {
    echo "⚠️  Warning: Supabase environment variables not found"
    echo "   Please set these in Netlify Dashboard:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - SUPABASE_ANON_KEY"
}

# Deploy
echo ""
echo "🚀 Deploying to production..."
netlify deploy --prod --build --site-id "$SITE_ID"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your site should be live at your Netlify URL"
echo ""
