# ✅ Production Readiness Checklist

Use this checklist before deploying to production.

## 🔐 Security Configuration

### Environment Variables

- [ ] `JWT_SECRET` - Generated using `openssl rand -base64 32` (minimum 32 characters)
- [ ] `DATABASE_URL` - Uses SSL/TLS connection (`sslmode=require`)
- [ ] `UPSTASH_REDIS_REST_URL` - Real Upstash Redis URL (not empty)
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Real token (not `***`)
- [ ] `NODE_ENV` - Set to `production`
- [ ] `NEXT_PUBLIC_APP_URL` - Set to your production domain (https://)
- [ ] `ALLOWED_ORIGINS` - Set to your production domain(s)
- [ ] `CSRF_SECRET` - Unique secret (not default)

### Password & Secrets

- [ ] Default admin password changed from `AdminPassword123!`
- [ ] `SESSION_SECRET` rotated from default
- [ ] `CSRF_SECRET` rotated from default
- [ ] All secrets are stored securely (not in git)
- [ ] `.env` file added to `.gitignore`

### Cookie Security

- [ ] Cookies use `Secure` flag (requires HTTPS)
- [ ] Cookies use `HttpOnly` flag
- [ ] Cookies use `SameSite=Strict` or `SameSite=Lax`
- [ ] Cookie expiry times are appropriate (15min access, 7day refresh)

### Rate Limiting

- [ ] Upstash Redis configured (not using in-memory in production)
- [ ] Rate limits are appropriate (`RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_WINDOW_MS`)
- [ ] Account lockout configured (`failedLoginAttempts`, `lockedUntil`)

### Database

- [ ] Prisma migrations applied (`npm run prisma:deploy`)
- [ ] Database backups configured
- [ ] Connection pooling enabled
- [ ] SSL/TLS enabled for database connections

## 🧪 Testing & Quality

### Tests

- [ ] All unit tests passing (`npm test`)
- [ ] Integration tests passing
- [ ] Test coverage > 70%
- [ ] Edge cases tested (locked accounts, expired tokens, rate limits)

### Code Quality

- [ ] ESLint passing (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No console.log statements in production code
- [ ] All TODO comments resolved

## 📊 Monitoring & Logging

### Sentry

- [ ] `NEXT_PUBLIC_SENTRY_DSN` configured
- [ ] Sentry initialization files present (sentry.\*.config.ts)
- [ ] Error tracking tested
- [ ] Performance monitoring enabled
- [ ] Alerts configured for critical errors

### Logging

- [ ] `LOG_LEVEL` set appropriately (info/warn in production)
- [ ] Structured logging implemented (Pino)
- [ ] Sensitive data not logged (passwords, tokens)
- [ ] Audit logs enabled for auth events

### Monitoring

- [ ] Uptime monitoring configured
- [ ] Database performance monitoring enabled
- [ ] API response time tracking
- [ ] Failed login spike alerts configured

## 🚀 Deployment

### Pre-Deployment

- [ ] `npm run build` succeeds
- [ ] All environment variables set in production
- [ ] Database migrations tested in staging
- [ ] Admin user seeded in production database
- [ ] HTTPS/SSL certificate configured

### Infrastructure

- [ ] Production server configured
- [ ] Load balancer configured (if applicable)
- [ ] CDN configured for static assets
- [ ] Database connection limits appropriate
- [ ] Redis connection limits appropriate

### DNS & Networking

- [ ] Domain DNS configured
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] CORS configured correctly
- [ ] Firewall rules configured

## 📋 Documentation

- [ ] README updated with deployment instructions
- [ ] API documentation complete
- [ ] Environment variables documented
- [ ] Security practices documented
- [ ] Incident response plan documented

## 🔄 Operational Readiness

### Backup & Recovery

- [ ] Database backup strategy defined
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] Data retention policy defined

### Secrets Rotation

- [ ] JWT secret rotation procedure documented
- [ ] Process to revoke all tokens defined
- [ ] Refresh token rotation tested
- [ ] Admin password rotation policy

### Maintenance

- [ ] Dependency updates planned (npm audit)
- [ ] Security patches monitoring configured
- [ ] Database maintenance windows scheduled
- [ ] Token cleanup job scheduled (expired/revoked tokens)

## 🛡️ Security Hardening

### Application Security

- [ ] SQL injection prevention verified (Prisma handles this)
- [ ] XSS prevention verified (Next.js handles this)
- [ ] CSRF protection implemented
- [ ] Rate limiting tested under load
- [ ] Account lockout tested
- [ ] Password requirements enforced

### Infrastructure Security

- [ ] Server access restricted (SSH keys only)
- [ ] Database access restricted (whitelist IPs)
- [ ] Environment variables encrypted at rest
- [ ] Secrets not in version control
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)

### Compliance

- [ ] GDPR compliance reviewed (if applicable)
- [ ] Data encryption at rest verified
- [ ] Data encryption in transit verified (TLS)
- [ ] Audit log retention policy defined
- [ ] Privacy policy updated

## 🔍 Final Checks

### Performance

- [ ] API response times < 200ms for login
- [ ] Database queries optimized (indexes)
- [ ] Redis latency acceptable
- [ ] JWT verification performant
- [ ] No memory leaks detected

### Functionality

- [ ] Login flow works end-to-end
- [ ] Token refresh works
- [ ] Logout clears cookies and revokes tokens
- [ ] Protected routes enforce authentication
- [ ] Admin role enforcement works
- [ ] Rate limiting works as expected
- [ ] Account lockout works as expected

### Error Handling

- [ ] Invalid credentials return generic error
- [ ] Expired tokens handled gracefully
- [ ] Database errors logged and reported
- [ ] Network errors handled gracefully
- [ ] Graceful degradation when Redis unavailable

## 📅 Post-Deployment

### Day 1

- [ ] Monitor error rates in Sentry
- [ ] Check database connection pooling
- [ ] Verify rate limiting effectiveness
- [ ] Review audit logs for anomalies
- [ ] Test login from multiple locations

### Week 1

- [ ] Review failed login attempts
- [ ] Check for locked accounts
- [ ] Analyze API response times
- [ ] Review security alerts
- [ ] Verify backup success

### Month 1

- [ ] Rotate JWT secret
- [ ] Review and clean expired tokens
- [ ] Update dependencies (security patches)
- [ ] Review audit logs for patterns
- [ ] Performance optimization review

---

## 🎯 Production Deployment Command

```bash
# 1. Build
npm run build

# 2. Deploy migrations
npm run prisma:deploy

# 3. Seed admin (if needed)
npm run seed

# 4. Start production server
npm start
```

---

## ⚠️ Critical Security Reminders

1. **NEVER** commit `.env` to version control
2. **ALWAYS** use HTTPS in production (Secure cookies require it)
3. **ROTATE** JWT_SECRET and SESSION_SECRET regularly
4. **MONITOR** failed login attempts for brute force attacks
5. **UPDATE** dependencies regularly for security patches
6. **BACKUP** database before major changes
7. **TEST** in staging before production deployment
8. **ENABLE** Sentry for production error tracking
9. **RESTRICT** database access to application servers only
10. **ENFORCE** strong password policy for admin users

---

**Status**: Use this checklist to ensure your production deployment is secure and reliable.

**Note**: This is a living document. Update it as your requirements evolve.
