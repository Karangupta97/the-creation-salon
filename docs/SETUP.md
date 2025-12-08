# 🚀 Complete Setup Guide - The Creation Salon Admin Panel

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Getting API Keys](#getting-api-keys)
6. [Running the Application](#running-the-application)
7. [Default Credentials](#default-credentials)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A **PostgreSQL database** (we'll use free tier from Neon)
- A **Redis instance** (we'll use free tier from Upstash)

---

## 📥 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/the-creation-salon.git
cd the-creation-salon
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the root directory by copying the example:

```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# Mac/Linux
cp .env.example .env
```

---

## 🔑 Environment Variables

Open the `.env` file and configure the following variables:

### ✅ REQUIRED Variables

These **MUST** be set for the application to work:

| Variable | Description | How to Get |
|----------|-------------|------------|
| `DATABASE_URL` | PostgreSQL connection string | [See Database Setup](#database-setup) |
| `JWT_SECRET` | Secret key for JWT tokens | [Generate](#generating-jwt-secret) |
| `UPSTASH_REDIS_REST_URL` | Redis URL for rate limiting | [Get from Upstash](#6-redis-upstash) |
| `UPSTASH_REDIS_REST_TOKEN` | Redis authentication token | [Get from Upstash](#6-redis-upstash) |

### ⚙️ OPTIONAL Variables

These are optional but recommended for production:

| Variable | Description | Default | How to Get |
|----------|-------------|---------|------------|
| `RESEND_API_KEY` | Email service API key | None (console logging) | [Get from Resend](#7-email-service-resend) |
| `EMAIL_FROM` | Sender email address | `noreply@yourdomain.com` | Your verified domain in Resend |
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking DSN | None (disabled) | [Get from Sentry](#8-error-tracking-sentry) |
| `NEXT_PUBLIC_APP_URL` | Your application URL | `http://localhost:3000` | Your deployed URL |
| `ADMIN_IP_WHITELIST` | Allowed IP addresses | All IPs allowed | Comma-separated IPs |
| `TOTP_APP_NAME` | App name in 2FA apps | `The Creation Salon` | Your app name |

---

## 🗄️ Database Setup

### Option 1: Neon (Recommended - Free Tier)

1. **Sign up** at [https://neon.tech](https://neon.tech)
2. **Create a new project**
3. **Copy the connection string** (it looks like this):
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech:5432/database?sslmode=require
   ```
4. **Paste it** into your `.env` file:
   ```env
   DATABASE_URL="your-connection-string-here"
   ```

### Option 2: Supabase (Free Tier)

1. Sign up at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (Transaction mode)
5. Paste into `.env` as `DATABASE_URL`

### Option 3: Railway (Free Tier)

1. Sign up at [https://railway.app](https://railway.app)
2. Create new **PostgreSQL** database
3. Copy the **Connection URL**
4. Paste into `.env` as `DATABASE_URL`

---

## 🔑 Getting API Keys

### 1. Generating JWT Secret

**Required** - Generate a strong 32-character secret:

**Windows (Command Prompt):**
```cmd
# Install OpenSSL from https://slproweb.com/products/Win32OpenSSL.html
# Or use PowerShell:
powershell -Command "[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))"
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

Copy the output and add to `.env`:
```env
JWT_SECRET="your-generated-secret-here"
```

---

### 2. Redis (Upstash)

**Required** - Free tier available:

1. **Sign up** at [https://upstash.com](https://upstash.com)
2. **Create a new Redis database**
   - Choose a region close to your users
   - Select **Free tier**
3. **Copy the credentials:**
   - Click on your database
   - Scroll to **REST API** section
   - Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
4. **Add to `.env`:**
   ```env
   UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your-token-here"
   ```

---

### 3. Email Service (Resend)

**Optional** - For password resets and 2FA notifications:

1. **Sign up** at [https://resend.com](https://resend.com)
2. **Verify your domain** (or use their test domain)
3. **Create an API key:**
   - Go to **API Keys** section
   - Click **Create API Key**
   - Copy the key (starts with `re_`)
4. **Add to `.env`:**
   ```env
   RESEND_API_KEY="re_your_api_key_here"
   EMAIL_FROM="noreply@yourdomain.com"
   ```

**Note:** If you skip this, emails will be logged to the console in development mode.

---

### 4. Error Tracking (Sentry)

**Optional** - For production error monitoring:

1. **Sign up** at [https://sentry.io](https://sentry.io)
2. **Create a new project** (select Next.js)
3. **Copy the DSN** from the setup page
4. **Add to `.env`:**
   ```env
   NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
   ```

---

## 🚀 Running the Application

### 1. Generate Prisma Client

```bash
npm run prisma:generate
```

### 2. Run Database Migrations

```bash
npm run prisma:migrate
```

This will create all necessary tables in your database.

### 3. Seed the Database

Create the default admin user:

```bash
npm run seed
```

This creates an admin account with:
- **Email:** `admin@example.com`
- **Password:** `AdminPassword123!`

⚠️ **Change this password immediately after first login!**

### 4. Start Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

### 5. Access Admin Panel

Open your browser and go to:
```
http://localhost:3000/admin/login
```

Login with the default credentials above.

---

## 🔐 Default Credentials

**Email:** `admin@example.com`  
**Password:** `AdminPassword123!`

⚠️ **IMPORTANT**: Change this password immediately:
1. Login with default credentials
2. Go to **Dashboard** → **Settings**
3. Update your password
4. Enable 2FA for added security

---

## 🛠️ Troubleshooting

### Database Connection Error

**Error:** `Can't reach database server`

**Solutions:**
1. Check if your database is **active** (Neon pauses after inactivity)
2. Verify `DATABASE_URL` in `.env` is correct
3. Ensure `sslmode=require` is at the end of the connection string
4. Check your internet connection

### Redis Connection Error

**Error:** `Rate limiting failed`

**Solutions:**
1. Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct
2. The app will fall back to in-memory rate limiting if Redis is unavailable
3. For production, ensure Upstash Redis is properly configured

### JWT Secret Missing

**Error:** `🚨 SECURITY ERROR: JWT_SECRET must be set in production`

**Solution:**
1. Generate a secret: `openssl rand -base64 32`
2. Add to `.env`: `JWT_SECRET="your-generated-secret"`
3. Restart the application

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solutions:**
1. Kill the process using port 3000
2. Or change the port: `npm run dev -- -p 3001`

### Migration Failed

**Error:** `Migration failed to apply`

**Solutions:**
```bash
# Reset and try again
npm run prisma:migrate reset
npm run prisma:migrate
npm run seed
```

---

## 📚 Additional Documentation

- **API Documentation:** [docs/auth/AUTH_README.md](./auth/AUTH_README.md)
- **Security Features:** [SECURITY_UPGRADE_COMPLETE.md](../SECURITY_UPGRADE_COMPLETE.md)
- **Production Deployment:** [docs/auth/PRODUCTION_CHECKLIST.md](./auth/PRODUCTION_CHECKLIST.md)
- **Architecture:** [docs/auth/ARCHITECTURE.md](./auth/ARCHITECTURE.md)

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Changed default admin password
- [ ] Generated strong `JWT_SECRET` (32+ characters)
- [ ] Configured `DATABASE_URL` with `sslmode=require`
- [ ] Set up Upstash Redis (not in-memory)
- [ ] Configured email service (Resend)
- [ ] Set `NODE_ENV=production`
- [ ] Configured `ADMIN_IP_WHITELIST` (optional but recommended)
- [ ] Enabled Sentry for error tracking
- [ ] Tested all features in staging environment

---

## 🆘 Need Help?

- **Issues:** [GitHub Issues](https://github.com/yourusername/the-creation-salon/issues)
- **Documentation:** [docs/INDEX.md](./INDEX.md)
- **Email:** support@yourcreationsalon.com

---

## 📝 Quick Reference

### Required Services (Free Tiers Available)

| Service | Purpose | Sign Up |
|---------|---------|---------|
| **Neon** | PostgreSQL Database | [neon.tech](https://neon.tech) |
| **Upstash** | Redis (Rate Limiting) | [upstash.com](https://upstash.com) |

### Optional Services (Free Tiers Available)

| Service | Purpose | Sign Up |
|---------|---------|---------|
| **Resend** | Email Sending | [resend.com](https://resend.com) |
| **Sentry** | Error Tracking | [sentry.io](https://sentry.io) |

---

**Built with ❤️ and 🔒**  
Security Rating: 10/10 ⭐
