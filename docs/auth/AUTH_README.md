# Admin Authentication System

Secure, production-ready Admin Login backend for Next.js App Router with comprehensive security features.

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: HttpOnly, Secure cookies with signed JWTs
- **Rate Limiting**: Upstash Redis with in-memory fallback
- **Brute Force Protection**: Account lockout after failed attempts
- **Audit Logging**: Comprehensive authentication event tracking
- **Token Rotation**: Refresh token rotation with revocation support
- **CSRF Protection**: Token-based CSRF validation
- **Role-Based Access**: Middleware-enforced admin role checks

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Upstash Redis account (optional, falls back to in-memory)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

Required packages:

- `@prisma/client` - Database ORM
- `bcrypt` - Password hashing
- `jose` - JWT handling
- `zod` - Input validation
- `pino` - Structured logging
- `@sentry/nextjs` - Error monitoring
- `@upstash/redis` & `@upstash/ratelimit` - Rate limiting

### 2. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

**Required Environment Variables:**

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# JWT Secret (Generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"

# Rate Limiting
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes

# Security
CSRF_SECRET="your-csrf-secret-key"

# Sentry (Optional)
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"

# Logging
LOG_LEVEL="info" # debug, info, warn, error
```

### 3. Database Setup

Generate Prisma client and run migrations:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### 4. Seed Admin User

Create your first admin user:

```bash
# Using default credentials
npx tsx prisma/seed.ts

# Or with custom credentials
ADMIN_EMAIL="admin@yourdomain.com" \
ADMIN_PASSWORD="YourSecurePassword123!" \
ADMIN_NAME="Your Name" \
npx tsx prisma/seed.ts
```

**⚠️ IMPORTANT**: Change the default password immediately after first login!

## 🏃 Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## 📡 API Endpoints

### POST `/api/admin/auth/login`

Authenticate admin user and issue tokens.

**Request:**

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "ok": true,
  "user": {
    "id": "user-id",
    "name": "Admin User",
    "email": "admin@example.com",
    "roles": ["admin"]
  },
  "expiresAt": "2024-01-01T12:00:00.000Z"
}
```

**Error Responses:**

- `400` - Validation error
- `401` - Invalid credentials
- `423` - Account locked (includes `lockoutDuration` in minutes)
- `429` - Too many requests

**Cookies Set:**

- `access_token` - JWT (15 minutes, HttpOnly, Secure, SameSite=Strict)
- `refresh_token` - JWT (7 days, HttpOnly, Secure, SameSite=Strict)

### POST `/api/admin/auth/refresh`

Refresh access token using refresh token from cookies.

**Success Response (200):**

```json
{
  "ok": true,
  "expiresAt": "2024-01-01T12:15:00.000Z"
}
```

**Error Response (401):**

```json
{
  "ok": false,
  "error": "Invalid refresh token"
}
```

### POST `/api/admin/auth/logout`

Logout user and revoke refresh token.

**Success Response (200):**

```json
{
  "ok": true,
  "message": "Logged out successfully"
}
```

## 🛡️ Security Middleware

The middleware (`middleware.ts`) protects all routes under `/admin/*`:

- Validates JWT access token from cookies
- Enforces `admin` role requirement
- Returns 401 for API routes or redirects to login for pages
- Adds user context to request headers (`x-user-id`, `x-user-email`, `x-user-roles`)

## 🔐 Security Best Practices

### Password Requirements

- Minimum 8 characters
- Stored as bcrypt hash with 10 salt rounds
- Never logged or returned in responses

### Account Lockout Policy

- **Threshold**: 5 failed login attempts
- **Duration**: 30 minutes
- **Monitoring**: Sentry alerts on lockouts
- **Reset**: Automatic on successful login

### Rate Limiting

- **IP-based**: 5 requests per 15 minutes per IP
- **Account-based**: 5 requests per 15 minutes per email
- **Storage**: Upstash Redis (fallback to in-memory for dev)

### Token Security

- **Access Token**: 15-minute expiry, HS256 signed
- **Refresh Token**: 7-day expiry, stored in DB with revocation
- **Cookies**: HttpOnly, Secure (production), SameSite=Strict
- **Rotation**: Refresh tokens support rotation strategy

### Audit Logging

All authentication events are logged to `auth_audit_logs` table:

- Login success/failure
- Account lockouts
- Token refreshes
- Logouts
- IP address and User-Agent tracking

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Specific Tests

```bash
npm test tests/unit/validators.test.ts
npm test tests/unit/jwt.test.ts
npm test tests/unit/auth.service.test.ts
npm test tests/integration/login-flow.test.ts
```

### Test Coverage

```bash
npm test -- --coverage
```

## 🔄 Key Rotation

### Rotating JWT Secret

1. Generate new secret:

```bash
openssl rand -base64 32
```

2. Update `.env`:

```env
JWT_SECRET="new-secret-key"
```

3. Restart application
4. All existing tokens will be invalidated
5. Users will need to re-authenticate

### Rotating Refresh Tokens

Refresh tokens are automatically rotated on use. To manually revoke:

```sql
-- Revoke all refresh tokens for a user
UPDATE refresh_tokens
SET is_revoked = true
WHERE admin_id = 'user-id';

-- Revoke all expired tokens
UPDATE refresh_tokens
SET is_revoked = true
WHERE expires_at < NOW();
```

## 📊 Monitoring & Alerts

### Sentry Integration

Configure Sentry DSN in `.env`:

```env
NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
```

**Monitored Events:**

- Failed login spikes (3+ failures)
- Account lockouts
- Authentication errors
- Token verification failures

### Structured Logging

Uses Pino for structured JSON logging:

```typescript
import logger from '@/lib/logger';

logger.info({ userId, action }, 'User action performed');
logger.error({ error, context }, 'Error occurred');
```

**Log Levels**: `debug`, `info`, `warn`, `error`

## 📁 Project Structure

```
.
├── app/
│   └── api/
│       └── admin/
│           └── auth/
│               ├── login/route.ts       # Login endpoint
│               ├── refresh/route.ts     # Token refresh
│               └── logout/route.ts      # Logout endpoint
├── lib/
│   ├── jwt.ts                          # JWT utilities
│   ├── logger.ts                       # Pino logger config
│   ├── prisma.ts                       # Prisma client
│   ├── rate-limit.ts                   # Rate limiting
│   ├── request-utils.ts                # Request helpers
│   ├── sentry.ts                       # Sentry config
│   └── validators/
│       └── auth.validator.ts           # Zod schemas
├── services/
│   └── auth.service.ts                 # Auth business logic
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── seed.ts                         # Admin user seeder
├── tests/
│   ├── setup.ts                        # Test configuration
│   ├── unit/                           # Unit tests
│   └── integration/                    # Integration tests
├── middleware.ts                        # Route protection
└── .env.example                        # Environment template
```

## 🚨 Troubleshooting

### "Account locked" error

Wait 30 minutes or manually unlock:

```sql
UPDATE admins
SET is_locked = false,
    locked_until = NULL,
    failed_login_attempts = 0
WHERE email = 'admin@example.com';
```

### Rate limit issues in development

Set higher limits in `.env`:

```env
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

### Database connection errors

Verify `DATABASE_URL` and ensure database is accessible:

```bash
npx prisma db pull
```

### Token verification failures

Check `JWT_SECRET` is set and consistent across restarts.

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Format code: `npx prettier --write .`
6. Commit changes
7. Submit pull request

---

**Security Notice**: This is a production-ready authentication system. Always use HTTPS in production, rotate secrets regularly, and monitor audit logs for suspicious activity.
