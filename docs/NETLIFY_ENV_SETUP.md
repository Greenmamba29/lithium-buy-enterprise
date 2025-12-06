# Netlify Environment Variables Setup

Quick reference guide for setting up environment variables in Netlify.

## Required Environment Variables

Copy these variables to Netlify Dashboard → Site Configuration → Environment Variables:

### Critical (App won't work without these):

```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Server
NODE_ENV=production
PORT=8888

# Redis (for job queues)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### Recommended (Core features):

```bash
# AI Services
PERPLEXITY_API_KEY=your_perplexity_api_key
GEMINI_API_KEY=your_gemini_api_key

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Optional (Additional features):

```bash
# Error Tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
SMTP_FROM=noreply@lithiumbuy.com

# Video Calls
DAILY_CO_API_KEY=your_daily_co_api_key

# E-Signatures
DOCUSIGN_CLIENT_ID=your_client_id
DOCUSIGN_CLIENT_SECRET=your_client_secret
DOCUSIGN_ACCOUNT_ID=your_account_id
DOCUSIGN_BASE_PATH=https://www.docusign.net
DOCUSIGN_REDIRECT_URI=https://your-site.netlify.app/api/docusign/callback

# Feature Flags
CONTENT_GENERATION_ENABLED=true
AUCTION_MARKETPLACE_ENABLED=true
PROCUREMENT_PLATFORM_ENABLED=true
```

## Setup Methods

### Method 1: Netlify Dashboard (UI)

1. Go to your site in Netlify
2. Navigate to: **Site configuration** → **Environment variables**
3. Click **Add a variable**
4. For each variable:
   - Enter the **Key** (e.g., `SUPABASE_URL`)
   - Enter the **Value** (e.g., `https://xxx.supabase.co`)
   - Click **Set variable**

### Method 2: Netlify CLI (Recommended for bulk import)

#### Install Netlify CLI:
```bash
npm install -g netlify-cli
```

#### Login:
```bash
netlify login
```

#### Link your site:
```bash
netlify link
```

#### Set individual variables:
```bash
netlify env:set SUPABASE_URL "https://your-project.supabase.co"
netlify env:set NODE_ENV "production"
# ... repeat for each variable
```

#### Bulk import from file:
```bash
# Create .env.production file (don't commit to git!)
# Then import all variables:
netlify env:import .env.production
```

### Method 3: netlify.toml (NOT RECOMMENDED for secrets)

⚠️ **Warning**: Never put secrets in netlify.toml as it's committed to git!

Only use for non-sensitive values:
```toml
[build.environment]
  NODE_VERSION = "20"
  NODE_ENV = "production"
```

## Verify Environment Variables

After setting variables, verify they're correctly set:

### Via CLI:
```bash
netlify env:list
```

### Via Dashboard:
1. Go to **Site configuration** → **Environment variables**
2. You should see all variables listed (values are hidden for security)

### During Build:
Check build logs to see if variables are loaded (sensitive values will be masked)

## Important Notes

### 🔒 Security Best Practices:
- ✅ Use Netlify's environment variables for all secrets
- ❌ Never commit `.env` files to git
- ❌ Never hardcode secrets in code
- ✅ Use different values for development and production
- ✅ Rotate API keys regularly
- ✅ Use minimal permissions for service accounts

### 🔄 Variable Updates:
- After adding/updating environment variables, **redeploy** your site
- Variables are only loaded during build time and function execution
- Use: `netlify deploy --prod` or trigger a new build in the dashboard

### 🌍 Deploy Contexts:
You can set different values for different contexts:
- **Production**: Main site
- **Deploy Previews**: Pull request previews
- **Branch Deploys**: Specific branch deployments

Set context-specific values in the Netlify dashboard under each variable.

## Quick Setup Script

Create a `.env.production` file locally (add to `.gitignore`!):

```bash
# Copy your .env file
cp .env .env.production

# Edit .env.production with production values
nano .env.production

# Import to Netlify
netlify env:import .env.production

# Delete the file (for security)
rm .env.production
```

## Troubleshooting

### Variables Not Working:
1. ✅ Check variable names are exact (case-sensitive)
2. ✅ Redeploy after adding variables
3. ✅ Check function logs for errors
4. ✅ Verify values don't have quotes or extra spaces

### Build Fails After Adding Variables:
1. Check build logs for specific errors
2. Verify all required variables are set
3. Test locally with same environment variables

### "Environment variable undefined" Error:
1. Make sure variable is set in Netlify dashboard
2. Redeploy the site
3. Check that variable name in code matches exactly

## Get Your API Keys

### Supabase:
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### Upstash Redis:
1. Go to [console.upstash.com](https://console.upstash.com)
2. Create a Redis database
3. Copy:
   - REST URL → `UPSTASH_REDIS_REST_URL`
   - REST Token → `UPSTASH_REDIS_REST_TOKEN`

### Stripe:
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get API keys from **Developers** → **API keys**
3. For production, toggle "View test data" OFF
4. Copy keys to environment variables

### Perplexity AI:
1. Sign up at [perplexity.ai](https://perplexity.ai)
2. Go to API settings
3. Generate API key

### Other Services:
- **Gemini**: [ai.google.dev](https://ai.google.dev)
- **Sentry**: [sentry.io](https://sentry.io)
- **Daily.co**: [daily.co](https://daily.co)
- **DocuSign**: [developers.docusign.com](https://developers.docusign.com)

---

**Need Help?** See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for full deployment guide.
