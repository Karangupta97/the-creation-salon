# Run This Command to Complete Setup

## Step 1: Enable Script Execution (One-time setup)

Open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then close and reopen your terminal.

## Step 2: Run Database Migration

```powershell
npx prisma migrate dev --name add_security_features
```

## Step 3: Regenerate Prisma Client

```powershell
npx prisma generate
```

## Step 4: Restart Dev Server

```powershell
npm run dev
```

## Alternative: Use CMD Instead of PowerShell

If you prefer not to change execution policy, use Command Prompt (cmd.exe):

1. Open Command Prompt
2. Navigate to project: `cd C:\Users\karan\Desktop\The-creation-salon`
3. Run: `npx prisma migrate dev --name add_security_features`
4. Run: `npx prisma generate`
5. Run: `npm run dev`

---

## What This Migration Does

- Adds `resetToken` and `resetTokenExpiry` fields to Admin table
- Creates new `Session` table for session management
- Adds indexes for performance

## After Migration

Test all new features:
1. Visit `/admin/dashboard/settings` - Enable 2FA
2. Visit `/admin/dashboard/sessions` - View active sessions
3. Visit `/admin/dashboard/activity` - See activity logs
4. Test password reset flow at `/admin/forgot-password`
