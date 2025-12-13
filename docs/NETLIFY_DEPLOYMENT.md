# Netlify Deployment Guide for LithiumBuy Enterprise

This guide provides step-by-step instructions for deploying the LithiumBuy Enterprise application to Netlify.

## Architecture Overview

The application is deployed as a hybrid architecture on Netlify:

- **Frontend**: React SPA served as static files from `dist/public`
- **Backend API**: Express.js application running as Netlify Functions (serverless)
- **Database**: Supabase PostgreSQL (external)
- **Caching**: Redis via Upstash (external)
- **File Storage**: Supabase Storage (external)

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Supabase Project**: Active Supabase project with database set up
4. **Redis Instance**: Upstash Redis instance (or alternative)
5. **Required API Keys**: See Environment Variables section below

## Step 1: Connect Repository to Netlify

1. Log in to your Netlify account
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify to access your repository
4. Select the `lithiumbuy` repository

## Step 2: Configure Build Settings

In the Netlify dashboard under "Site configuration" → "Build & deploy" → "Build settings":

### Build Settings:
- **Base directory**: Leave empty (use root `/`)
- **Build command**: `npm run build`
- **Publish directory**: `dist/public`
- **Functions directory**: `netlify/functions`

### Environment:
- **Node version**: 20.x (set in netlify.toml)

## Step 3: Set Environment Variables

Go to "Site configuration" → "Environment variables" and add all required variables:

### Required Variables:

#### Database (Supabase)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

#### Server Configuration
```
NODE_ENV=production
PORT=8888
```
> **Note**: Netlify Functions run on port 8888 by default

#### Redis (Upstash) - For Job Queues
```
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### Optional Variables:

#### Perplexity AI (Market Intelligence)
```
PERPLEXITY_API_KEY=your_perplexity_api_key
PERPLEXITY_MODEL=sonar-pro
```

#### Stripe (Payments)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

#### Google Gemini AI
```
GEMINI_API_KEY=your_gemini_api_key
```

#### Sentry (Error Tracking)
```
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### Email (SMTP)
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
SMTP_FROM=noreply@lithiumbuy.com
```

#### Daily.co (Video)
```
DAILY_CO_API_KEY=your_daily_co_api_key
```

#### DocuSign (E-Signature)
```
DOCUSIGN_CLIENT_ID=your_client_id
DOCUSIGN_CLIENT_SECRET=your_client_secret
DOCUSIGN_ACCOUNT_ID=your_account_id
DOCUSIGN_BASE_PATH=https://www.docusign.net
DOCUSIGN_REDIRECT_URI=https://your-netlify-site.netlify.app/api/docusign/callback
```

#### Feature Flags
```
CONTENT_GENERATION_ENABLED=true
AUCTION_MARKETPLACE_ENABLED=true
PROCUREMENT_PLATFORM_ENABLED=true
```

### Setting Environment Variables in Netlify:

**Via Netlify Dashboard:**
1. Go to "Site configuration" → "Environment variables"
2. Click "Add a variable"
3. Add each variable one by one

**Via Netlify CLI:**
```bash
netlify env:set VARIABLE_NAME "value"
```

**Bulk Import (Recommended):**
1. Create a `.env.production` file locally (DO NOT commit to git)
2. Use Netlify CLI to import:
```bash
netlify env:import .env.production
```

## Step 4: Database Setup

Your Supabase database needs to be set up before deployment:

### Option A: Supabase Dashboard
1. Go to SQL Editor in your Supabase Dashboard
2. Run migrations in order from the `server/db/migrations` folder:
   - `001_initial_schema.sql`
   - `002_indexes.sql`
   - `003_rls_policies.sql`
   - `005_transaction_helpers.sql`
   - `006_auction_marketplace.sql`
   - `007_procurement_platform.sql`
   - `008_market_intelligence.sql`
   - `009_content_generation.sql`
   - `010_rls_policies_new_tables.sql`

### Option B: Migration Runner
Set your Supabase credentials locally and run:
```bash
npm run migrate
```

## Step 5: Deploy

### Automatic Deployment:
1. Push your code to the main branch on GitHub
2. Netlify will automatically build and deploy
3. Monitor the build logs in the Netlify dashboard

### Manual Deployment via CLI:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link your project
netlify link

# Deploy to production
netlify deploy --prod
```

## Step 6: Post-Deployment Verification

After deployment, verify the following:

### 1. Health Checks
```bash
curl https://your-site.netlify.app/api/health
curl https://your-site.netlify.app/api/ready
```

### 2. Test API Endpoints
```bash
# Test authentication
curl https://your-site.netlify.app/api/user

# Test database connection
curl https://your-site.netlify.app/api/health
```

### 3. Check Function Logs
- Go to Netlify Dashboard → Functions
- View logs for the `server` function
- Look for any errors or warnings

### 4. Test Frontend
- Visit your site URL
- Test user registration and login
- Verify all pages load correctly
- Check browser console for errors

## Step 7: Configure Custom Domain (Optional)

1. Go to "Site configuration" → "Domain management"
2. Click "Add custom domain"
3. Follow the instructions to configure your DNS
4. Netlify will automatically provision an SSL certificate

## Important Notes & Limitations

### WebSocket Limitations
⚠️ **Important**: Netlify Functions are stateless and do not support persistent WebSocket connections. If your application requires real-time WebSocket features:

**Options:**
1. **Deploy WebSocket server separately**: Use Railway, Render, or Heroku for the WebSocket server
2. **Use Netlify with external WebSocket service**: Deploy API on Netlify but WebSockets on a separate platform
3. **Alternative real-time solutions**: Use Supabase Realtime, Pusher, or Ably for real-time features

Current implementation: WebSocket routes are configured but may not work as expected in serverless environment.

### Function Execution Time
- Netlify Functions have a maximum execution time of 10 seconds (free tier) or 26 seconds (paid tier)
- Long-running operations should use background functions or external job queues

### Cold Starts
- Serverless functions may experience cold starts (300-500ms latency) after periods of inactivity
- Consider using Netlify's "Keep functions warm" feature (paid plans)

### File Uploads
- Netlify has a 50MB function payload limit
- For large file uploads, use direct-to-storage uploads (Supabase Storage)

## Monitoring & Debugging

### View Function Logs
```bash
netlify functions:log server
```

### Enable Debug Logging
Add to environment variables:
```
DEBUG=*
LOG_LEVEL=debug
```

### Sentry Integration
The application includes Sentry error tracking. Ensure `SENTRY_DSN` is set in environment variables.

### Performance Monitoring
Monitor performance in:
- Netlify Analytics (Site overview)
- Function logs (Function tab)
- Sentry Performance (if configured)

## Continuous Deployment

### Auto Deploy Branches
Configure automatic deployments for specific branches:

1. Go to "Site configuration" → "Build & deploy" → "Deploy contexts"
2. Enable "Deploy previews" for pull requests
3. Configure branch deploys for development/staging branches

### Build Hooks
Create build hooks for external triggers:

1. Go to "Site configuration" → "Build & deploy" → "Build hooks"
2. Create a new hook
3. Use the webhook URL to trigger builds from external services

## Rollback

To rollback to a previous deployment:

1. Go to "Deploys"
2. Find the previous successful deploy
3. Click "Publish deploy"

Or via CLI:
```bash
netlify rollback
```

## Cost Optimization

### Free Tier Limits:
- 100GB bandwidth/month
- 300 build minutes/month
- 125k function requests/month
- 100 hours function runtime/month

### Optimization Tips:
1. **Enable Gzip/Brotli compression** (automatic on Netlify)
2. **Optimize images**: Use WebP format and responsive images
3. **Code splitting**: Already configured in vite.config.ts
4. **Cache static assets**: Configured in netlify.toml
5. **Lazy load components**: Implement code splitting for large components

## Troubleshooting

### Build Fails

**Error: "Command failed: npm run build"**
- Check build logs for specific errors
- Verify all dependencies are in package.json
- Ensure Node version is 20.x

**Error: "Module not found"**
- Run `npm install` locally to verify dependencies
- Check that all imports use correct paths
- Verify tsconfig.json paths are correct

### Function Errors

**Error: "Function invocation timeout"**
- Optimize database queries
- Use database indexes
- Implement caching
- Consider background functions for long operations

**Error: "Environment variable not found"**
- Verify all required environment variables are set in Netlify
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new variables

### API Not Working

**404 on API routes:**
- Verify netlify.toml redirects are correct
- Check _redirects file exists in dist/public
- Ensure function is deployed (check Functions tab)

**CORS errors:**
- Verify CORS configuration in server/middleware/security.ts
- Add your Netlify domain to allowed origins
- Check browser console for specific CORS errors

## Support & Resources

- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **Netlify Community**: [community.netlify.com](https://community.netlify.com)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Application Documentation**: See other files in `/docs` folder

## Next Steps

After successful deployment:

1. ✅ Set up monitoring and alerts (Sentry, Netlify)
2. ✅ Configure backup strategy for database
3. ✅ Set up staging environment
4. ✅ Implement CI/CD pipeline
5. ✅ Configure custom domain and SSL
6. ✅ Set up analytics (Netlify Analytics, Google Analytics)
7. ✅ Test all features in production
8. ✅ Document any production-specific configurations

---

**Last Updated**: December 2024
**Maintainer**: LithiumBuy Team
