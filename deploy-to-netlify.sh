#!/bin/bash

# Complete Netlify Deployment Script
# This script sets ALL required environment variables and deploys

echo "🚀 Complete Netlify Deployment for LithiumBuy Enterprise"
echo "========================================================"

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Login to Netlify (will open browser)
echo "Step 1: Logging in to Netlify..."
netlify login

# Link to your site
echo "Step 2: Linking to your Netlify site..."
netlify link

# Set ALL environment variables at once
echo "Step 3: Setting ALL environment variables..."

# REQUIRED - Core configuration
netlify env:set NODE_ENV "production"
netlify env:set PORT "8888"

# Already set by user (but we'll ensure they're there)
echo "✓ Assuming SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY already set in Netlify dashboard"

# OPTIONAL - Add if you have these services
read -p "Do you have Redis/Upstash? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter UPSTASH_REDIS_REST_URL: " redis_url
    read -p "Enter UPSTASH_REDIS_REST_TOKEN: " redis_token
    netlify env:set UPSTASH_REDIS_REST_URL "$redis_url"
    netlify env:set UPSTASH_REDIS_REST_TOKEN "$redis_token"
fi

read -p "Do you have Perplexity API key? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter PERPLEXITY_API_KEY: " perplexity_key
    netlify env:set PERPLEXITY_API_KEY "$perplexity_key"
fi

read -p "Do you have Stripe? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter STRIPE_SECRET_KEY: " stripe_secret
    read -p "Enter STRIPE_PUBLISHABLE_KEY: " stripe_public
    read -p "Enter STRIPE_WEBHOOK_SECRET: " stripe_webhook
    netlify env:set STRIPE_SECRET_KEY "$stripe_secret"
    netlify env:set STRIPE_PUBLISHABLE_KEY "$stripe_public"
    netlify env:set STRIPE_WEBHOOK_SECRET "$stripe_webhook"
fi

# Deploy to production
echo "Step 4: Deploying to production..."
netlify deploy --prod

echo ""
echo "✅ Deployment complete!"
echo "Your site should be live at your Netlify URL"
echo ""
