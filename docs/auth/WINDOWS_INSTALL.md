# 🪟 Windows Installation Guide

Step-by-step installation instructions for Windows users.

## ⚠️ PowerShell Execution Policy Issue

If you see this error:

```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

**Solution 1: Use Command Prompt (Recommended)**

1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to your project: `cd c:\Users\karan\Desktop\The-creation-salon`
4. Run commands using `cmd`

**Solution 2: Enable PowerShell Scripts**

1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
3. Type `Y` to confirm
4. Close and reopen PowerShell

---

## 📦 Step 1: Install Dependencies

Open **Command Prompt** (cmd) and run:

```cmd
cd c:\Users\karan\Desktop\The-creation-salon
npm install
```

This installs ~25 packages including:

- Authentication: `bcrypt`, `jose`
- Database: `@prisma/client`, `@neondatabase/serverless`
- Logging: `pino`, `pino-pretty`
- Testing: `vitest`, `supertest`
- Utilities: `zod`, `@upstash/redis`, `@sentry/nextjs`

**Expected time**: 2-3 minutes

---

## 🗄️ Step 2: Setup Database

### Generate Prisma Client

```cmd
npm run prisma:generate
```

This generates TypeScript types from your Prisma schema.

### Run Database Migrations

```cmd
npm run prisma:migrate
```

When prompted for migration name, enter: `init`

This creates three tables in your Neon PostgreSQL database:

- `admins` - Admin user accounts
- `refresh_tokens` - JWT refresh tokens
- `auth_audit_logs` - Authentication event logs

**Verify Migration**:

```cmd
npm run prisma:studio
```

This opens Prisma Studio in your browser at http://localhost:5555

---

## 👤 Step 3: Create Admin User

### Using Default Credentials

```cmd
npm run seed
```

**Default credentials**:

- Email: `admin@example.com`
- Password: `AdminPassword123!`

### Using Custom Credentials (Command Prompt)

```cmd
set ADMIN_EMAIL=admin@yourdomain.com
set ADMIN_PASSWORD=YourSecurePassword123!
set ADMIN_NAME=Your Name
npm run seed
```

### Using Custom Credentials (PowerShell)

```powershell
$env:ADMIN_EMAIL="admin@yourdomain.com"
$env:ADMIN_PASSWORD="YourSecurePassword123!"
$env:ADMIN_NAME="Your Name"
npm run seed
```

**⚠️ IMPORTANT**: Change this password after first login!

---

## 🔑 Step 4: Configure Upstash Redis Token

1. Open `.env` file in VS Code or Notepad
2. Find this line:
   ```env
   UPSTASH_REDIS_REST_TOKEN=***
   ```
3. Replace `***` with your actual Upstash Redis token
4. Save the file

**Where to find your token**:

1. Go to https://console.upstash.com/
2. Select your Redis database
3. Copy `UPSTASH_REDIS_REST_TOKEN` from the REST API section

---

## 🚀 Step 5: Start Development Server

```cmd
npm run dev
```

Server starts at: http://localhost:3000

**You should see**:

```
  ▲ Next.js 16.0.3
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

---

## ✅ Step 6: Test the System

### Option A: Using PowerShell

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"AdminPassword123!"}'
```

### Option B: Using curl (if installed)

```cmd
curl -X POST http://localhost:3000/api/admin/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"AdminPassword123!\"}"
```

### Option C: Using Postman or Thunder Client

1. Install Thunder Client extension in VS Code, or use Postman
2. Create new POST request
3. URL: `http://localhost:3000/api/admin/auth/login`
4. Headers: `Content-Type: application/json`
5. Body (JSON):
   ```json
   {
     "email": "admin@example.com",
     "password": "AdminPassword123!"
   }
   ```
6. Send request

**Expected Response**:

```json
{
  "ok": true,
  "user": {
    "id": "...",
    "name": "System Administrator",
    "email": "admin@example.com",
    "roles": ["admin"]
  },
  "expiresAt": "2024-01-01T12:15:00.000Z"
}
```

**Cookies Set**:

- `access_token` (15 minutes)
- `refresh_token` (7 days)

---

## 🧪 Step 7: Run Tests

```cmd
npm test
```

**Expected output**:

```
✓ tests/unit/validators.test.ts (6 tests)
✓ tests/unit/jwt.test.ts (5 tests)
✓ tests/unit/auth.service.test.ts (5 tests)
✓ tests/integration/login-flow.test.ts (2 tests)

Test Files  4 passed (4)
     Tests  18 passed (18)
```

---

## 🎨 Step 8: Code Quality Checks

### Linting

```cmd
npm run lint
```

### Formatting

```cmd
npm run format:check
```

### Format Code

```cmd
npm run format
```

---

## 📊 Verify Everything Works

### 1. Check Database

```cmd
npm run prisma:studio
```

- Opens http://localhost:5555
- You should see your admin user in `admins` table

### 2. Check Logs

Development server shows structured logs:

```json
{
  "level": "info",
  "time": "12:00:00",
  "msg": "Using Upstash Redis for rate limiting"
}
```

### 3. Test Login Flow

1. Send login request (see Step 6)
2. Check response has `ok: true`
3. Check browser DevTools → Application → Cookies
4. Should see `access_token` and `refresh_token`

---

## 🔧 Common Windows Issues

### Issue: npm command not found

**Fix**:

1. Install Node.js from https://nodejs.org/
2. Restart Command Prompt
3. Verify: `node --version` and `npm --version`

### Issue: Git not found (for Prisma)

**Fix**:

1. Install Git from https://git-scm.com/
2. Restart Command Prompt

### Issue: Port 3000 already in use

**Fix**:

```cmd
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use different port
set PORT=3001
npm run dev
```

### Issue: Database connection timeout

**Fix**:

1. Check internet connection
2. Verify `DATABASE_URL` in `.env`
3. Check Neon database status at https://neon.tech/

### Issue: bcrypt installation fails

**Fix**:

1. Install Visual Studio Build Tools:
   https://visualstudio.microsoft.com/downloads/
2. Select "Desktop development with C++"
3. Restart and run `npm install` again

### Issue: TypeScript errors after install

**Fix**:

```cmd
npm run prisma:generate
```

---

## 📁 File Locations (Windows Paths)

```
c:\Users\karan\Desktop\The-creation-salon\
├── .env                          # ← Your environment variables
├── prisma\schema.prisma          # ← Database schema
├── app\api\admin\auth\           # ← API routes
│   ├── login\route.ts
│   ├── refresh\route.ts
│   └── logout\route.ts
├── lib\                          # ← Core libraries
├── services\auth.service.ts      # ← Business logic
├── middleware.ts                 # ← Route protection
└── tests\                        # ← Test files
```

---

## 🎯 Quick Commands Reference

```cmd
# Development
npm run dev                    # Start server
npm test                       # Run tests
npm run lint                   # Check code

# Database
npm run prisma:studio          # View database
npm run prisma:migrate         # Run migrations
npm run seed                   # Seed admin user

# Code Quality
npm run format                 # Format code
npm run build                  # Build for production
```

---

## ✅ Installation Complete!

You now have a fully functional, production-ready admin authentication system with:

- ✅ Secure JWT authentication
- ✅ Rate limiting with Redis
- ✅ Account lockout protection
- ✅ Comprehensive audit logging
- ✅ Unit and integration tests
- ✅ Sentry error monitoring
- ✅ Production-ready middleware

**Next Steps**:

1. Read `AUTH_README.md` for complete API documentation
2. Review `PRODUCTION_CHECKLIST.md` before deploying
3. Customize the system for your needs
4. Change the default admin password!

---

**Need Help?** See the other documentation files:

- `SETUP_GUIDE.md` - Detailed setup guide
- `AUTH_README.md` - Complete API documentation
- `QUICK_REFERENCE.md` - Command reference
- `PRODUCTION_CHECKLIST.md` - Pre-deployment checklist
