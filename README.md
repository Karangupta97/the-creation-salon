# The Creation Salon - Admin Authentication System

Secure, production-ready Admin Login backend for Next.js App Router with comprehensive security features.

## 🚀 Quick Start

**New to this project?** Complete installation guide:

👉 **[docs/SETUP.md](./docs/SETUP.md)** - Complete Setup Guide (Database, API Keys, Installation)

**Or if you're on Windows:**

👉 **[docs/auth/WINDOWS_INSTALL.md](./docs/auth/WINDOWS_INSTALL.md)** - Windows-specific installation

## 📚 Documentation

All documentation is located in the **[`/docs`](./docs/)** folder:

### Getting Started

- **[docs/INDEX.md](./docs/INDEX.md)** - Documentation index and navigation
- **[docs/auth/WINDOWS_INSTALL.md](./docs/auth/WINDOWS_INSTALL.md)** - Windows installation guide
- **[docs/auth/SETUP_GUIDE.md](./docs/auth/SETUP_GUIDE.md)** - General setup instructions
- **[docs/auth/README_IMPLEMENTATION.md](./docs/auth/README_IMPLEMENTATION.md)** - Implementation summary

### Reference

- **[docs/auth/AUTH_README.md](./docs/auth/AUTH_README.md)** - Complete API documentation
- **[docs/auth/QUICK_REFERENCE.md](./docs/auth/QUICK_REFERENCE.md)** - Quick command reference
- **[docs/auth/ARCHITECTURE.md](./docs/auth/ARCHITECTURE.md)** - System architecture

### Production

- **[docs/auth/PRODUCTION_CHECKLIST.md](./docs/auth/PRODUCTION_CHECKLIST.md)** - Pre-deployment checklist
- **[docs/auth/PROJECT_SUMMARY.md](./docs/auth/PROJECT_SUMMARY.md)** - File structure & metrics

## 🔑 Features

- ✅ JWT authentication (access + refresh tokens)
- ✅ bcrypt password hashing
- ✅ HttpOnly, Secure cookies
- ✅ Rate limiting with Upstash Redis
- ✅ Account lockout protection
- ✅ Comprehensive audit logging
- ✅ Sentry error monitoring
- ✅ Full test coverage
- ✅ Production-ready

## 📡 API Endpoints

- `POST /api/admin/auth/login` - Login with credentials
- `POST /api/admin/auth/refresh` - Refresh access token
- `POST /api/admin/auth/logout` - Logout and revoke tokens

## 🏃 Quick Commands

```bash
# Install dependencies
npm install

# Setup database
npm run prisma:generate
npm run prisma:migrate

# Seed admin user
npm run seed

# Start development
npm run dev

# Run tests
npm test
```

## 📁 Project Structure

```
The-creation-salon/
├── docs/                       # 📚 All documentation
├── app/api/admin/auth/         # 🔐 API routes
├── lib/                        # 🛠️ Core libraries
├── services/                   # 💼 Business logic
├── prisma/                     # 🗄️ Database schema
├── tests/                      # 🧪 Test files
└── middleware.ts               # 🛡️ Route protection
```

## 🔐 Default Credentials

```
Email: admin@example.com
Password: AdminPassword123!
```

⚠️ **Change immediately after first login!**

## 🆘 Need Help?

- Installation issues? → [docs/auth/WINDOWS_INSTALL.md](./docs/auth/WINDOWS_INSTALL.md)
- API questions? → [docs/auth/AUTH_README.md](./docs/auth/AUTH_README.md)
- Quick commands? → [docs/auth/QUICK_REFERENCE.md](./docs/auth/QUICK_REFERENCE.md)
- Full documentation? → [docs/INDEX.md](./docs/INDEX.md)

## 📊 Stats

| Metric              | Value |
| ------------------- | ----- |
| Code Files          | 23    |
| API Endpoints       | 3     |
| Database Tables     | 3     |
| Test Files          | 4     |
| Documentation Pages | 9     |

## 🛡️ Security

- Password hashing with bcrypt
- JWT tokens with rotation
- Rate limiting & account lockout
- CSRF & CORS protection
- Comprehensive audit logs
- Sentry monitoring

## 📝 License

MIT

---

**Built with**: Next.js • Prisma • PostgreSQL • JWT • bcrypt • Redis • Sentry
