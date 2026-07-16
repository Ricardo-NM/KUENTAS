import crypto from "node:crypto";
import * as OTPAuth from "otpauth";
import { getPrisma } from "@/lib/prisma";

export const passwordChangeOtpExpiresMs = 10 * 60 * 1000;

function getPasswordChangeSecret() {
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

function generatePasswordChangeOtp() {
  const secret = OTPAuth.Secret.fromHex(crypto.randomBytes(20).toString("hex"));
  const otp = new OTPAuth.TOTP({
    issuer: "Kuentas",
    label: "Cambio de contrasena",
    algorithm: "SHA1",
    digits: 6,
    period: passwordChangeOtpExpiresMs / 1000,
    secret,
  });

  return otp.generate();
}

export function hashPasswordChangeOtp(code: string) {
  return crypto
    .createHmac("sha256", getPasswordChangeSecret())
    .update(normalizeOtp(code))
    .digest("hex");
}

export function isPasswordChangeOtpExpired(expiresAt: Date, now = new Date()) {
  return expiresAt <= now;
}

export async function createPasswordChangeOtp(userId: string) {
  const code = generatePasswordChangeOtp();
  const expiresAt = new Date(Date.now() + passwordChangeOtpExpiresMs);
  const prisma = getPrisma();

  await prisma.$transaction([
    prisma.passwordChangeToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    }),
    prisma.passwordChangeToken.create({
      data: {
        userId,
        tokenHash: hashPasswordChangeOtp(code),
        expiresAt,
      },
      select: {
        id: true,
      },
    }),
  ]);

  return {
    code,
    expiresAt,
  };
}

export async function cancelPasswordChangeOtp(userId: string) {
  await getPrisma().passwordChangeToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
}

export async function verifyPasswordChangeOtp(userId: string, code: string) {
  const prisma = getPrisma();
  const token = await prisma.passwordChangeToken.findFirst({
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
    isPasswordChangeOtpExpired(token.expiresAt) ||
    !timingSafeEqual(token.tokenHash, hashPasswordChangeOtp(code))
  ) {
    return null;
  }

  const usedAt = new Date();

  await prisma.passwordChangeToken.update({
    where: {
      id: token.id,
    },
    data: {
      usedAt,
    },
  });

  return {
    id: token.id,
    expiresAt: token.expiresAt,
    usedAt,
  };
}
