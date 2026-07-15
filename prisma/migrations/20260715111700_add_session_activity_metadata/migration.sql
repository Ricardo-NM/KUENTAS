ALTER TABLE "Session"
ADD COLUMN "userAgent" TEXT,
ADD COLUMN "deviceLabel" TEXT NOT NULL DEFAULT 'Dispositivo desconocido',
ADD COLUMN "ipHash" TEXT,
ADD COLUMN "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Session_lastSeenAt_idx" ON "Session"("lastSeenAt");
