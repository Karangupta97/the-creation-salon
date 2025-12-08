# 🚀 Quick Setup Guide

Follow these steps to set up the secure Admin Authentication System.

## Step 1: Install Dependencies

**Note**: You need to run this command manually due to PowerShell execution policy.

Open Command Prompt (cmd) or PowerShell with execution policy enabled, then run:

```bash
npm install
```

This will install all required packages including:

- `bcrypt` & `@types/bcrypt` - Password hashing
- `jose` - JWT token handling
- `pino` & `pino-pretty` - Structured logging
- `@sentry/nextjs` - Error monitoring
- `supertest` & `@types/supertest` - API testing
- `eslint-config-prettier` & `prettier` - Code formatting
- `tsx` - TypeScript execution

## Step 2: Configure Environment Variables

Your `.env` file has been updated with the JWT configuration. Make sure you have:

```env
JWT_SECRET=SKNPsEfKStuJhAA99SKsgAZL6uQ+sruUenEzUZHgh+Y=
UPSTASH_REDIS_REST_URL=https://right-skylark-34382.upstash.io
UPSTASH_REDIS_REST_TOKEN=*** (add your actual token)
```

## Step 3: Database Setup

Run Prisma migrations to create the database schema:

```bash
npm run prisma:generate
npm run prisma:migrate
```

This creates:

- `admins` table - Admin users with security fields
- `refresh_tokens` table - JWT refresh token storage
- `auth_audit_logs` table - Authentication event logging

## Step 4: Seed Admin User

Create your first admin user:

```bash
npm run seed
```

Or with custom credentials:

```bash
# Windows Command Prompt
set ADMIN_EMAIL=admin@yourdomain.com
set ADMIN_PASSWORD=YourSecurePassword123!
set ADMIN_NAME=Your Name
npm run seed

# PowerShell
$env:ADMIN_EMAIL="admin@yourdomain.com"
$env:ADMIN_PASSWORD="YourSecurePassword123!"
$env:ADMIN_NAME="Your Name"
npm run seed
```

## Step 5: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Step 6: Test the Authentication

### Test Login

```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"AdminPassword123!\"}"
```

### Test with PowerShell

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"AdminPassword123!"}'
```

## 📁 What Was Created

### Database Schema (`prisma/schema.prisma`)

- Admin user model with security features
- Refresh token storage with rotation
- Audit log for all auth events

### API Routes

- `POST /api/admin/auth/login` - Login endpoint
- `POST /api/admin/auth/refresh` - Refresh access token
- `POST /api/admin/auth/logout` - Logout and revoke tokens

### Security Libraries

- `lib/jwt.ts` - JWT token generation/verification
- `lib/rate-limit.ts` - Upstash Redis rate limiter with fallback
- `lib/logger.ts` - Pino structured logging
- `lib/sentry.ts` - Error monitoring hooks
- `lib/validators/` - Zod input validation

### Services

- `services/auth.service.ts` - Authentication business logic
  - Password verification with bcrypt
  - Account lockout after 5 failed attempts
  - Rate limiting by IP and email
  - Audit logging

### Middleware

- `middleware.ts` - Route protection
  - Validates JWT cookies
  - Enforces admin role
  - Redirects unauthorized users

### Tests

- Unit tests for validators, JWT, auth service
- Integration test for login flow
- Run with: `npm test`

### CI/CD

- `.github/workflows/ci.yml` - GitHub Actions workflow
  - Runs tests and linting
  - Security scanning
  - Automatic builds

## 🔒 Security Features Implemented

✅ bcrypt password hashing (10 salt rounds)
✅ HttpOnly, Secure cookies (SameSite=Strict)
✅ JWT with short-lived access (15m) and refresh tokens (7d)
✅ Rate limiting (5 attempts per 15 minutes)
✅ Account lockout (5 failed attempts = 30min lockout)
✅ Upstash Redis with in-memory fallback
✅ Comprehensive audit logging
✅ Sentry error monitoring integration
✅ CSRF protection utilities
✅ Role-based access control
✅ Refresh token rotation and revocation

## 📖 Next Steps

1. **Review the AUTH_README.md** for complete documentation
2. **Update Upstash Redis token** in `.env` (replace \*\*\*)
3. **Configure Sentry** (optional) for production monitoring
4. **Run tests** to verify everything works: `npm test`
5. **Review security settings** for production deployment

## 🛠️ Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Create new migration
npm run seed             # Seed admin user

# Testing
npm test                 # Run all tests
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run format:check     # Check formatting
```

## ⚠️ Important Security Notes

1. **Change default password** immediately after first login
2. **Use HTTPS** in production (set `NODE_ENV=production`)
3. **Rotate JWT_SECRET** regularly
4. **Monitor audit logs** for suspicious activity
5. **Enable Sentry** for production error tracking
6. **Use strong Redis token** from Upstash dashboard

## 🐛 Troubleshooting

### PowerShell Script Execution Error

If you see "running scripts is disabled", use Command Prompt (cmd) instead or enable PowerShell scripts:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Database Connection Error

Verify your `DATABASE_URL` in `.env` is correct and accessible.

### Rate Limiting Not Working

Make sure `UPSTASH_REDIS_REST_TOKEN` is set correctly (replace the `***`).

### TypeScript Errors

Some type errors may appear until packages are installed. Run `npm install` first.

---

**For detailed documentation, see [AUTH_README.md](./AUTH_README.md)**
