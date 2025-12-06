# Deployment Guide

## Prerequisites

- Node.js 20+ and npm
- Supabase account and project
- Redis (Upstash recommended)
- Domain name (for production)
- SSL certificate

## Environment Setup

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Configure all required variables (see `ENV_CONFIG.md`)

## Database Setup

### Supabase Migration

1. **Option A: Supabase Dashboard**
   - Go to SQL Editor in Supabase Dashboard
   - Run migrations in order:
     - `001_initial_schema.sql`
     - `002_indexes.sql`
     - `003_rls_policies.sql`
     - `005_transaction_helpers.sql`
     - `006_auction_marketplace.sql`
     - `007_procurement_platform.sql`
     - `008_market_intelligence.sql`
     - `009_content_generation.sql`
     - `010_rls_policies_new_tables.sql`

2. **Option B: Supabase CLI**
   ```bash
   supabase db push
   ```

3. **Option C: Migration Runner**
   ```bash
   npm run migrate
   ```

## Build

```bash
npm install
npm run build
```

## Deployment Options

### Netlify (Recommended for full-stack deployment)

Netlify provides seamless deployment with serverless functions support.

**Quick Start:**
```bash
# Connect your GitHub repository to Netlify
# Configure build settings in Netlify dashboard:
# - Build command: npm run build
# - Publish directory: dist/public
# - Functions directory: netlify/functions

# Set environment variables in Netlify dashboard
# See docs/NETLIFY_ENV_SETUP.md for required variables
```

**Detailed Guide:** See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)

**Key Features:**
- ✅ Serverless Functions for Express API
- ✅ Automatic SSL certificates
- ✅ CDN for static assets
- ✅ Deploy previews for PRs
- ✅ Environment variable management
- ⚠️ Note: WebSocket support is limited (consider external service)

**Configuration Files:**
- `netlify.toml` - Build and deploy configuration
- `netlify/functions/server.ts` - Serverless function wrapper
- `client/public/_redirects` - SPA routing rules

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Configure environment variables in Vercel dashboard

4. Set build command: `npm run build`
5. Set output directory: `dist`

### Railway

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Configure environment variables

### AWS/EC2

1. Build on server:
```bash
npm install
npm run build
```

2. Start with PM2:
```bash
pm2 start dist/index.cjs --name lithiumbuy
pm2 save
pm2 startup
```

3. Configure Nginx reverse proxy:
```nginx
server {
    listen 80;
    server_name lithiumbuy.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Set up SSL with Let's Encrypt:
```bash
certbot --nginx -d lithiumbuy.com
```

## Post-Deployment

1. **Verify Health Checks:**
   - `https://your-domain.com/health`
   - `https://your-domain.com/ready`

2. **Warm Cache:**
   ```bash
   curl -X POST https://your-domain.com/api/admin/cache/warm
   ```

3. **Schedule Background Jobs:**
   - Perplexity data sync (runs automatically)
   - Daily market briefings (6 AM EST)

4. **Monitor:**
   - Set up error tracking (Sentry recommended)
   - Monitor Redis connection
   - Monitor API response times

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] SSL certificate installed
- [ ] Health checks passing
- [ ] Background jobs running
- [ ] Error tracking configured
- [ ] Monitoring set up
- [ ] Backup strategy in place
