# Security Guide

## Authentication & Authorization

### Authentication
- Supabase Auth for user authentication
- JWT tokens for API access
- Session management via Supabase

### Authorization
- Row Level Security (RLS) policies on all tables
- Role-based access control (buyer, supplier, admin)
- Route-level authorization middleware

## API Security

### Rate Limiting
- Implemented via `express-rate-limit`
- Per-IP and per-user limits
- Different limits for authenticated vs anonymous

### Input Validation
- Zod schemas for all API inputs
- Type-safe validation
- SQL injection prevention via parameterized queries

### CORS
- Configured for production domain
- Credentials allowed for authenticated requests

## Database Security

### RLS Policies
- All tables have RLS enabled
- Policies enforce data access rules
- Users can only access their own data

### Connection Security
- SSL/TLS for all database connections
- Service role key never exposed to client
- Environment variables for sensitive data

## Data Protection

### Sensitive Data
- Passwords: Hashed via Supabase Auth
- API Keys: Stored in environment variables
- Payment Info: Handled by Stripe (PCI compliant)

### Data Encryption
- HTTPS for all communications
- Database encryption at rest (Supabase)
- Encrypted backups

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Regular updates** - Keep dependencies updated
3. **Security headers** - Implemented in middleware
4. **Error handling** - Don't expose internal errors
5. **Audit logging** - Log security-relevant events

## Security Checklist

- [ ] All environment variables configured
- [ ] RLS policies tested
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] HTTPS enforced
- [ ] Security headers set
- [ ] Dependencies scanned for vulnerabilities
- [ ] Error messages don't leak information
