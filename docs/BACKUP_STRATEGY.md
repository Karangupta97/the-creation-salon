# Database Backup & Recovery Strategy

## Overview

This guide covers automated backup strategies for your Neon PostgreSQL database to ensure data safety and business continuity.

## Neon Built-in Features

### Point-in-Time Recovery (PITR)

Neon provides automatic point-in-time recovery:

- **Retention**: 7 days (Free tier) or 30 days (Paid plans)
- **Granularity**: Restore to any second within the retention window
- **Location**: Neon Dashboard → Your Project → Restore

### Branch-based Backups

Use Neon branches for safe testing and backups:

```bash
# Create a backup branch
npx neonctl branches create --name backup-$(date +%Y%m%d)

# Restore from branch
npx neonctl branches restore --branch backup-20250128
```

## Automated Backup Solutions

### 1. GitHub Actions Automated Backups

Create `.github/workflows/database-backup.yml`:

```yaml
name: Database Backup

on:
  schedule:
    # Daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PostgreSQL Client
        run: |
          sudo apt-get update
          sudo apt-get install -y postgresql-client

      - name: Create Backup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"
          pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
          gzip "$BACKUP_FILE"

      - name: Upload to S3/R2
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Sync to S3
        run: |
          aws s3 cp backup-*.sql.gz s3://your-backup-bucket/database-backups/
          # Keep only last 30 days
          aws s3 ls s3://your-backup-bucket/database-backups/ | \
            sort -r | tail -n +31 | awk '{print $4}' | \
            xargs -I {} aws s3 rm s3://your-backup-bucket/database-backups/{}
```

### 2. Cloudflare R2 Backups (Cost-effective)

Install Wrangler:

```bash
npm install -g wrangler
wrangler login
```

Create backup script `scripts/backup-db.ts`:

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import { createReadStream } from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const execAsync = promisify(exec);

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.sql.gz`;

  // Create backup
  await execAsync(`pg_dump "${process.env.DATABASE_URL}" | gzip > ${filename}`);

  // Upload to R2
  const fileStream = createReadStream(filename);
  await r2Client.send(
    new PutObjectCommand({
      Bucket: 'database-backups',
      Key: `the-creation-salon/${filename}`,
      Body: fileStream,
    })
  );

  console.log(`✓ Backup uploaded: ${filename}`);

  // Cleanup local file
  await execAsync(`rm ${filename}`);
}

backup().catch(console.error);
```

Add to `package.json`:

```json
{
  "scripts": {
    "backup": "tsx scripts/backup-db.ts"
  }
}
```

### 3. Neon Branching Strategy

Automated branch backups using Neon API:

```typescript
// scripts/create-backup-branch.ts
async function createBackupBranch() {
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${process.env.NEON_PROJECT_ID}/branches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        branch: {
          name: `backup-${new Date().toISOString().split('T')[0]}`,
        },
      }),
    }
  );

  const data = await response.json();
  console.log(`✓ Backup branch created: ${data.branch.name}`);
}
```

## Backup Verification

Test your backups monthly:

```bash
# Download latest backup
aws s3 cp s3://your-bucket/database-backups/backup-latest.sql.gz .

# Create test database
createdb test_restore

# Restore
gunzip -c backup-latest.sql.gz | psql test_restore

# Verify data
psql test_restore -c "SELECT COUNT(*) FROM admins;"

# Cleanup
dropdb test_restore
```

## Recovery Procedures

### From Neon PITR

1. Go to Neon Dashboard
2. Select your project
3. Click "Restore" tab
4. Choose timestamp
5. Create new branch or replace current

### From SQL Backup

```bash
# Restore entire database
gunzip -c backup-20250128.sql.gz | psql "$DATABASE_URL"

# Restore specific table
gunzip -c backup-20250128.sql.gz | \
  psql "$DATABASE_URL" --single-transaction \
  --table admins --table sessions
```

## Monitoring & Alerts

Set up backup monitoring:

```yaml
# .github/workflows/backup-monitor.yml
name: Backup Monitor

on:
  schedule:
    - cron: '0 8 * * *' # Check daily

jobs:
  check-backups:
    runs-on: ubuntu-latest
    steps:
      - name: Check latest backup age
        run: |
          LATEST=$(aws s3 ls s3://your-bucket/database-backups/ | sort | tail -n 1 | awk '{print $1" "$2}')
          AGE=$(( ($(date +%s) - $(date -d "$LATEST" +%s)) / 3600 ))

          if [ $AGE -gt 36 ]; then
            echo "⚠️ Latest backup is $AGE hours old!"
            # Send alert to Discord/Slack
            curl -X POST "$DISCORD_WEBHOOK" \
              -H "Content-Type: application/json" \
              -d "{\"content\":\"Database backup is $AGE hours old!\"}"
            exit 1
          fi

          echo "✓ Backup is recent ($AGE hours old)"
```

## Best Practices

1. **3-2-1 Rule**:
   - 3 copies of data
   - 2 different storage media
   - 1 off-site backup

2. **Retention Policy**:
   - Daily backups: Keep 7 days
   - Weekly backups: Keep 4 weeks
   - Monthly backups: Keep 12 months

3. **Encryption**:
   - Encrypt backups at rest (S3/R2 handles this)
   - Use encrypted connections for transfers

4. **Testing**:
   - Test restore monthly
   - Document recovery time objective (RTO)
   - Measure recovery point objective (RPO)

5. **Access Control**:
   - Limit backup access to authorized personnel
   - Use IAM roles with minimal permissions
   - Enable MFA for backup storage

## Cost Optimization

### Neon (Free Tier)

- ✓ 7-day PITR included
- ✓ Unlimited branches
- Limitation: 3 GB storage

### Cloudflare R2

- ✓ No egress fees
- ✓ $0.015/GB/month storage
- ✓ 10GB free tier

### AWS S3

- Standard: $0.023/GB/month
- S3 Glacier: $0.004/GB/month (retrieval time: hours)
- Use lifecycle policies to move old backups to Glacier

## Emergency Contacts

Document your backup access credentials:

```
Neon Dashboard: https://console.neon.tech
  - Email: [REDACTED]
  - 2FA: Google Authenticator

R2 Dashboard: https://dash.cloudflare.com
  - Account ID: [REDACTED]
  - API Token: [REDACTED - in .env]

Recovery Runbook: docs/RECOVERY_RUNBOOK.md
```

## Automated Setup Commands

```bash
# Install dependencies
npm install @aws-sdk/client-s3 pg

# Set up backup script
mkdir -p scripts
cp docs/backup-db.example.ts scripts/backup-db.ts

# Add to crontab (local backups)
crontab -e
# Add: 0 2 * * * cd /path/to/project && npm run backup

# Set environment variables
echo "R2_ACCOUNT_ID=your-account-id" >> .env
echo "R2_ACCESS_KEY_ID=your-access-key" >> .env
echo "R2_SECRET_ACCESS_KEY=your-secret-key" >> .env
echo "NEON_API_KEY=your-neon-api-key" >> .env
echo "NEON_PROJECT_ID=your-project-id" >> .env
```

## Next Steps

1. Choose backup method (Neon branches recommended for simplicity)
2. Set up automated backups (GitHub Actions or cron)
3. Configure monitoring and alerts
4. Test restore procedure
5. Document recovery runbook
6. Schedule quarterly disaster recovery drills
