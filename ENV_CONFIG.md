# Environment Variables Configuration

This document lists all environment variables required for the LithiumBuy Enterprise platform.

## Required Environment Variables

### Database (Supabase)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

### Perplexity Labs API
```env
PERPLEXITY_API_KEY=your_perplexity_api_key
PERPLEXITY_MODEL=sonar-pro  # Optional, defaults to sonar-pro
```

### Redis (Upstash) - For Job Queues
```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### Stripe - For Escrow Payments
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...  # For frontend
```

## Optional Environment Variables


### Google Gemini AI
```env
GEMINI_API_KEY=your_gemini_api_key
```

### Email Service (SMTP)
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_password
SMTP_FROM=noreply@lithiumbuy.com
```

### Daily.co Video Service
```env
DAILY_CO_API_KEY=your_daily_co_api_key
```

### DocuSign - E-Signature Integration
```env
DOCUSIGN_CLIENT_ID=your_client_id
DOCUSIGN_CLIENT_SECRET=your_client_secret
DOCUSIGN_ACCOUNT_ID=your_account_id
DOCUSIGN_BASE_URL=https://demo.docusign.net  # or https://www.docusign.net for production
DOCUSIGN_REDIRECT_URI=https://your-domain.com/auth/docusign/callback  # For OAuth flow
DOCUSIGN_ACCESS_TOKEN=your_access_token  # Optional: for testing (use JWT in production)
```

### Server Configuration
```env
PORT=5000
NODE_ENV=development  # or production
```

### Feature Flags
```env
CONTENT_GENERATION_ENABLED=true
AUCTION_MARKETPLACE_ENABLED=true
PROCUREMENT_PLATFORM_ENABLED=true
```

## Environment Variable Validation

The server will validate required environment variables at startup. Missing required variables will cause the server to fail to start with a clear error message.

## Production Checklist

Before deploying to production, ensure:

- [ ] All required environment variables are set
- [ ] API keys are from production accounts (not test/sandbox)
- [ ] Stripe keys are live keys (not test keys)
- [ ] Database connection strings point to production database
- [ ] Redis connection is configured for production
- [ ] Email service is configured
- [ ] All external service API keys are valid and have sufficient quotas


