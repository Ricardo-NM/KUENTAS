-- AlterTable
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

-- Existing accounts predate email verification and should remain able to sign in.
UPDATE "User"
SET "emailVerifiedAt" = CURRENT_TIMESTAMP
WHERE "emailVerifiedAt" IS NULL;

-- CreateTable
CREATE TABLE "AccountVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountVerificationToken_tokenHash_key" ON "AccountVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AccountVerificationToken_userId_idx" ON "AccountVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "AccountVerificationToken_expiresAt_idx" ON "AccountVerificationToken"("expiresAt");

-- CreateIndex
CREATE INDEX "AccountVerificationToken_usedAt_idx" ON "AccountVerificationToken"("usedAt");

-- AddForeignKey
ALTER TABLE "AccountVerificationToken" ADD CONSTRAINT "AccountVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
