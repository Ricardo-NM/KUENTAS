import crypto from "node:crypto";
import * as OTPAuth from "otpauth";
import { getPrisma } from "@/lib/prisma";

export const accountDeletionOtpExpiresMs = 10 * 60 * 1000;

function getAccountDeletionSecret() {
  const configuredSecret = process.env.SESSION_SECRET;

  if (configuredSecret && configuredSecret.length >= 32) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }

  return "development-session-secret-at-least-32-chars";
}

function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function normalizeOtp(code: string) {
  return code.replace(/\s+/g, "").trim();
}

function generateAccountDeletionOtp() {
  const secret = OTPAuth.Secret.fromHex(crypto.randomBytes(20).toString("hex"));
  const otp = new OTPAuth.TOTP({
    issuer: "Kuentas",
    label: "Eliminacion de cuenta",
    algorithm: "SHA1",
    digits: 6,
    period: accountDeletionOtpExpiresMs / 1000,
    secret,
  });

  return otp.generate();
}

export function hashAccountDeletionOtp(code: string) {
  return crypto
    .createHmac("sha256", getAccountDeletionSecret())
    .update(normalizeOtp(code))
    .digest("hex");
}

export function isAccountDeletionOtpExpired(
  expiresAt: Date,
  now = new Date(),
) {
  return expiresAt <= now;
}

export async function createAccountDeletionOtp(userId: string) {
  const code = generateAccountDeletionOtp();
  const expiresAt = new Date(Date.now() + accountDeletionOtpExpiresMs);
  const prisma = getPrisma();

  await prisma.accountDeletionToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  const token = await prisma.accountDeletionToken.create({
    data: {
      userId,
      tokenHash: hashAccountDeletionOtp(code),
      expiresAt,
    },
    select: {
      id: true,
    },
  });

  return {
    id: token.id,
    code,
    expiresAt,
  };
}

export async function cancelAccountDeletionOtp(userId: string) {
  await getPrisma().accountDeletionToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
}

export async function verifyAccountDeletionOtp(userId: string, code: string) {
  const token = await getPrisma().accountDeletionToken.findFirst({
    where: {
      userId,
      usedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      tokenHash: true,
      expiresAt: true,
    },
  });

  if (
    !token ||
    isAccountDeletionOtpExpired(token.expiresAt) ||
    !timingSafeEqual(token.tokenHash, hashAccountDeletionOtp(code))
  ) {
    return null;
  }

  return token;
}
