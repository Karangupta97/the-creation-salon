# 🎯 Quick Reference - Admin Auth System

## 🚀 Installation (Run Once)

```bash
# Install all dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed admin user (default: admin@example.com / AdminPassword123!)
npm run seed
```

## 🏃 Daily Development

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Check code quality
npm run lint
npm run format:check

# View database
npm run prisma:studio
```

## 🔑 Environment Variables Required

```env
DATABASE_URL="postgresql://..."              # ✅ Already set
JWT_SECRET="..."                             # ✅ Already set
UPSTASH_REDIS_REST_URL="..."                 # ✅ Already set
UPSTASH_REDIS_REST_TOKEN="***"               # ⚠️ REPLACE WITH REAL TOKEN
```

## 📡 API Endpoints

### Login

```bash
POST /api/admin/auth/login
{
  "email": "admin@example.com",
  "password": "AdminPassword123!"
}
```

### Refresh Token

```bash
POST /api/admin/auth/refresh
# Uses refresh_token cookie automatically
```

### Logout

```bash
POST /api/admin/auth/logout
# Clears cookies and revokes tokens
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/unit/validators.test.ts

# Run with coverage
npm run test:coverage
```

## 🗄️ Database Commands

```bash
# View database in browser
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database (WARNING: deletes data)
npx prisma migrate reset

# Seed admin user again
npm run seed
```

## 🔐 Security Defaults

| Feature              | Value               |
| -------------------- | ------------------- |
| Access Token Expiry  | 15 minutes          |
| Refresh Token Expiry | 7 days              |
| Max Login Attempts   | 5                   |
| Lockout Duration     | 30 minutes          |
| Rate Limit           | 5 requests / 15 min |
| Password Min Length  | 8 characters        |

## 🔒 Default Admin Credentials

**⚠️ CHANGE AFTER FIRST LOGIN!**

```
Email: admin@example.com
Password: AdminPassword123!
```

## 📁 Important Files

```
prisma/schema.prisma        # Database schema
services/auth.service.ts    # Auth business logic
middleware.ts               # Route protection
.env                        # Environment config
```

## 🐛 Common Issues & Fixes

### Issue: PowerShell script execution error

**Fix**: Use Command Prompt (cmd) instead of PowerShell

### Issue: Database connection error

**Fix**: Check `DATABASE_URL` in `.env`

### Issue: Rate limiting not working

**Fix**: Set real `UPSTASH_REDIS_REST_TOKEN` in `.env`

### Issue: TypeScript errors after install

**Fix**: Run `npm run prisma:generate`

### Issue: Account locked

**Fix**: Wait 30 min OR manually unlock in database:

```sql
UPDATE admins SET is_locked = false, locked_until = NULL WHERE email = 'admin@example.com';
```

## 📚 Documentation

- `SETUP_GUIDE.md` - Complete setup instructions
- `AUTH_README.md` - Full API & security documentation
- `PROJECT_SUMMARY.md` - Complete file structure

## 🎨 Code Quality

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Update `NEXT_PUBLIC_APP_URL` to your domain
3. Use HTTPS (required for Secure cookies)
4. Rotate `JWT_SECRET` regularly
5. Enable Sentry monitoring
6. Use Upstash Redis (not in-memory)
7. Set strong `ADMIN_PASSWORD`

## ⚡ Quick Test

```bash
# Test login endpoint (PowerShell)
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"AdminPassword123!"}'
```

---

**Need help?** See `SETUP_GUIDE.md` for detailed instructions.
