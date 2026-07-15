import crypto from "node:crypto";
import { getPrisma } from "@/lib/prisma";

export const passwordResetTokenExpiresMs = 30 * 60 * 1000;

function getPasswordResetSecret() {
  const configuredSecret = process.env.SESSION_SECRET;

  if (configuredSecret && configuredSecret.length >= 32) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }

  return "development-session-secret-at-least-32-chars";
}

function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string) {
  return crypto
    .createHmac("sha256", getPasswordResetSecret())
    .update(token)
    .digest("hex");
}

export function isPasswordResetTokenExpired(expiresAt: Date, now = new Date()) {
  return expiresAt <= now;
}

export function buildPasswordResetUrl(origin: string, token: string) {
  const url = new URL("/recuperacion", origin);
  url.searchParams.set("token", token);

  return url.toString();
}

export async function createPasswordResetToken(userId: string) {
  const token = generatePasswordResetToken();
  const expiresAt = new Date(Date.now() + passwordResetTokenExpiresMs);
  const prisma = getPrisma();

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: {
        userId,
        usedAt: null,
      },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash: hashPasswordResetToken(token),
        expiresAt,
      },
      select: {
        id: true,
      },
    }),
  ]);

  return {
    token,
    expiresAt,
  };
}

export async function verifyPasswordResetToken(token: string) {
  const prisma = getPrisma();
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash: hashPasswordResetToken(token),
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    isPasswordResetTokenExpired(resetToken.expiresAt)
  ) {
    return null;
  }

  return {
    id: resetToken.id,
    userId: resetToken.userId,
  };
}

export async function markPasswordResetTokenUsed(tokenId: string) {
  await getPrisma().passwordResetToken.update({
    where: {
      id: tokenId,
    },
    data: {
      usedAt: new Date(),
    },
  });
}
