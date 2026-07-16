-- CreateTable
CREATE TABLE "PasswordChangeToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordChangeToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordChangeToken_tokenHash_key" ON "PasswordChangeToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordChangeToken_userId_idx" ON "PasswordChangeToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordChangeToken_expiresAt_idx" ON "PasswordChangeToken"("expiresAt");

-- CreateIndex
CREATE INDEX "PasswordChangeToken_usedAt_idx" ON "PasswordChangeToken"("usedAt");

-- AddForeignKey
ALTER TABLE "PasswordChangeToken" ADD CONSTRAINT "PasswordChangeToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
