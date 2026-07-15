-- AlterTable
ALTER TABLE "LoginAttempt" ADD COLUMN "key" TEXT;
ALTER TABLE "LoginAttempt" ADD COLUMN "ipHash" TEXT;
ALTER TABLE "LoginAttempt" ADD COLUMN "scope" TEXT;

-- Preserve existing email-only attempt rows before making the new columns required.
UPDATE "LoginAttempt"
SET
    "key" = 'login:email:' || "email",
    "scope" = 'email'
WHERE "key" IS NULL;

-- Existing rows had email as required; new IP-only rows do not.
ALTER TABLE "LoginAttempt" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "LoginAttempt" ALTER COLUMN "key" SET NOT NULL;
ALTER TABLE "LoginAttempt" ALTER COLUMN "scope" SET NOT NULL;

-- DropIndex
DROP INDEX "LoginAttempt_email_key";

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoginAttempt_key_key" ON "LoginAttempt"("key");

-- CreateIndex
CREATE INDEX "LoginAttempt_email_idx" ON "LoginAttempt"("email");

-- CreateIndex
CREATE INDEX "LoginAttempt_ipHash_idx" ON "LoginAttempt"("ipHash");

-- CreateIndex
CREATE INDEX "LoginAttempt_scope_idx" ON "LoginAttempt"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_usedAt_idx" ON "PasswordResetToken"("usedAt");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
