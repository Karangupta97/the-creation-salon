-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "lastLoginDevice" TEXT,
ADD COLUMN     "lastLoginIp" TEXT,
ADD COLUMN     "maxConcurrentSessions" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "auth_audit_logs" ADD COLUMN     "deviceFingerprint" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "riskScore" INTEGER;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "deviceFingerprint" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "revokedReason" TEXT;

-- CreateTable
CREATE TABLE "trusted_devices" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "deviceFingerprint" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "firstSeenIp" TEXT NOT NULL,
    "lastSeenIp" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isTrusted" BOOLEAN NOT NULL DEFAULT false,
    "trustGrantedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trusted_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_alerts" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ipAddress" TEXT,
    "location" TEXT,
    "deviceInfo" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "permissions" TEXT[],
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trusted_devices_adminId_idx" ON "trusted_devices"("adminId");

-- CreateIndex
CREATE INDEX "trusted_devices_deviceFingerprint_idx" ON "trusted_devices"("deviceFingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "trusted_devices_adminId_deviceFingerprint_key" ON "trusted_devices"("adminId", "deviceFingerprint");

-- CreateIndex
CREATE INDEX "security_alerts_adminId_idx" ON "security_alerts"("adminId");

-- CreateIndex
CREATE INDEX "security_alerts_isRead_idx" ON "security_alerts"("isRead");

-- CreateIndex
CREATE INDEX "security_alerts_severity_idx" ON "security_alerts"("severity");

-- CreateIndex
CREATE INDEX "security_alerts_createdAt_idx" ON "security_alerts"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE INDEX "permissions_category_idx" ON "permissions"("category");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "auth_audit_logs_riskScore_idx" ON "auth_audit_logs"("riskScore");

-- CreateIndex
CREATE INDEX "auth_audit_logs_deviceFingerprint_idx" ON "auth_audit_logs"("deviceFingerprint");

-- CreateIndex
CREATE INDEX "sessions_deviceFingerprint_idx" ON "sessions"("deviceFingerprint");

-- CreateIndex
CREATE INDEX "sessions_lastActivity_idx" ON "sessions"("lastActivity");

-- AddForeignKey
ALTER TABLE "trusted_devices" ADD CONSTRAINT "trusted_devices_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_alerts" ADD CONSTRAINT "security_alerts_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
