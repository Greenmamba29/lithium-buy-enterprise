# Developer Setup Guide

## Prerequisites

- Node.js 20+ and npm
- Git
- Code editor (VS Code recommended)
- Supabase account (free tier works)

## Initial Setup

1. **Clone Repository:**
```bash
git clone https://github.com/Greenmamba29/lithium-buy-enterprise.git
cd lithium-buy-enterprise
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Set Up Environment:**
```bash
cp .env.example .env
```

4. **Configure Environment Variables:**
   - Get Supabase credentials from your project dashboard
   - Add API keys for external services (optional for development)
   - See `ENV_CONFIG.md` for complete list

## Database Setup

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and service role key

2. **Run Migrations:**
   - Option A: Use Supabase Dashboard SQL Editor
   - Option B: Use migration runner (when implemented)

3. **Verify Setup:**
```bash
npm run check
```

## Development

1. **Start Development Server:**
```bash
npm run dev
```

2. **Access Application:**
   - Frontend: http://localhost:5000
   - API: http://localhost:5000/api

3. **Run Tests:**
```bash
npm test
```

4. **Type Checking:**
```bash
npm run check
```

5. **Linting:**
```bash
npm run lint
npm run lint:fix
```

## Project Structure

```
LithiumBuyEnterprise/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic
│   ├── db/              # Database migrations
│   └── utils/           # Utilities
├── shared/              # Shared types/schemas
└── docs/                # Documentation
```

## Key Technologies

- **Frontend:** React 19, TypeScript, TanStack Query, Wouter
- **Backend:** Express, TypeScript, Supabase
- **Database:** PostgreSQL (via Supabase)
- **Caching:** Redis (Upstash)
- **Job Queue:** BullMQ
- **Styling:** Tailwind CSS, shadcn/ui

## Common Tasks

### Adding a New API Endpoint

1. Create route handler in `server/routes/`
2. Create service in `server/services/`
3. Register route in `server/routes.ts`
4. Add to API documentation

### Adding a New Database Table

1. Create migration in `server/db/migrations/`
2. Add RLS policies
3. Update TypeScript types in `shared/`

### Adding a New Frontend Page

1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Create hooks if needed in `client/src/hooks/`

## Debugging

1. **Backend Logs:**
   - Check console output
   - Use logger utility: `import { logger } from '../utils/logger.js'`

2. **Frontend Debugging:**
   - Use React DevTools
   - Check browser console
   - Use TanStack Query DevTools

3. **Database Queries:**
   - Use Supabase Dashboard SQL Editor
   - Check Supabase logs

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -ti:5000 | xargs kill -9
```

### Database Connection Issues
- Verify Supabase credentials in `.env`
- Check Supabase project status
- Verify network connectivity

### Redis Connection Issues
- Verify Upstash credentials
- Check Redis URL format
- Job queues will work without Redis (with warnings)

## Getting Help

- Check `ARCHITECTURE.md` for system design
- Check `IMPLEMENTATION_PLAN.md` for current status
- Review existing code for patterns
- Check GitHub issues
