# Admin and Demo Credentials

This document contains the default admin and demo login credentials for the Lithium & Lux platform.

## Creating Admin Users

To create admin and demo users in Supabase, run:

```bash
tsx scripts/create-admin-user.ts
```

Or using npm:

```bash
npm run create-admin
```

> **Note:** Make sure you have `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set in your `.env` file before running this script.

## Default Credentials

### Admin Account
- **Email:** `admin@lithiumlux.com`
- **Password:** `Admin123!@#`
- **Role:** `admin`
- **Access:** Full admin dashboard access

### Demo Account
- **Email:** `demo@lithiumlux.com`
- **Password:** `Demo123!@#`
- **Role:** `buyer`
- **Access:** Standard buyer account for testing

## Login

1. Navigate to `/login` on your application
2. Enter the email and password from above
3. Click "Sign In"

## Security Notes

⚠️ **IMPORTANT:**
- Change these passwords immediately in production
- These are default credentials for development/testing only
- Never commit real credentials to the repository
- Consider using environment variables for production credentials

## Updating Credentials

To update the credentials, edit `scripts/create-admin-user.ts` and modify the `users` array, then run the script again.










