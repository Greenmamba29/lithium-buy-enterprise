# Netlify Deployment Guide

## Prerequisites

1. Netlify account
2. Netlify Personal Access Token (PAT)
3. GitHub repository connected (or manual deployment)

## Quick Deployment

### Option 1: Using Netlify CLI

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Authenticate**:
   ```bash
   export NETLIFY_AUTH_TOKEN="your_pat_here"
   netlify login --auth $NETLIFY_AUTH_TOKEN
   ```

3. **Initialize site** (first time only):
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Choose a team
   - Site name: `lithiumbuy-enterprise` (or your preferred name)

4. **Build and deploy**:
   ```bash
   npm run build
   netlify deploy --prod
   ```

### Option 2: Using Netlify Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/public`
   - **Node version**: `20`

5. Click "Deploy site"

## Environment Variables Setup

After deployment, configure environment variables in Netlify Dashboard:

1. Go to Site settings → Environment variables
2. Add the following **required** variables:

### Required Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
NODE_ENV=production
PORT=8888
```

### Optional Variables (add as needed)

```env
# Perplexity Labs API
PERPLEXITY_API_KEY=your_perplexity_api_key

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Sentry
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email Service (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_password
SMTP_FROM=noreply@lithiumbuy.com

# Daily.co Video Service
DAILY_CO_API_KEY=your_daily_co_api_key

# DocuSign
DOCUSIGN_CLIENT_ID=your_client_id
DOCUSIGN_CLIENT_SECRET=your_client_secret
DOCUSIGN_ACCOUNT_ID=your_account_id
DOCUSIGN_BASE_URL=https://demo.docusign.net
DOCUSIGN_REDIRECT_URI=https://your-domain.com/auth/docusign/callback

# Log Aggregation
LOG_AGGREGATION_ENABLED=true
LOG_AGGREGATION_URL=https://logs.example.com/api/logs
LOG_AGGREGATION_API_KEY=your_api_key
LOG_LEVEL=info

# Feature Flags
CONTENT_GENERATION_ENABLED=true
AUCTION_MARKETPLACE_ENABLED=true
PROCUREMENT_PLATFORM_ENABLED=true
```

## Netlify Configuration

The `netlify.toml` file is already configured with:

```toml
[build]
  command = "npm run build"
  publish = "dist/public"

[build.environment]
  NODE_VERSION = "20"
  NODE_ENV = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Important Notes

1. **Port Configuration**: Netlify Functions use port `8888` by default. The Express server should use this port or read from `process.env.PORT`.

2. **Serverless Functions**: If deploying as serverless functions, you may need to:
   - Create a Netlify function wrapper
   - Or use Netlify's serverless functions for API routes

3. **Static Files**: The build outputs static files to `dist/public/`, which Netlify will serve.

4. **API Routes**: For API routes to work, you may need to:
   - Use Netlify serverless functions
   - Or deploy the Express server separately (e.g., Railway, Render)

## Troubleshooting

### Build Fails

- Check Node version (should be 20)
- Verify all dependencies are in `package.json`
- Check build logs in Netlify dashboard

### Environment Variables Not Working

- Ensure variables are set in Netlify dashboard (not just `.env`)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### API Routes Not Working

- API routes may need to be converted to Netlify Functions
- Or deploy backend separately and update API URLs in frontend

## Manual Deployment Script

Use the provided script for automated deployment:

```bash
chmod +x scripts/netlify-deploy.sh
./scripts/netlify-deploy.sh
```

Or set the token and run:

```bash
export NETLIFY_AUTH_TOKEN="your_pat_here"
./scripts/netlify-deploy.sh
```

## Post-Deployment

1. **Verify deployment**: Check the site URL provided by Netlify
2. **Test functionality**: Verify all features work correctly
3. **Set up custom domain** (optional): In Site settings → Domain management
4. **Enable HTTPS**: Automatically enabled by Netlify
5. **Monitor**: Check Netlify dashboard for build status and logs
