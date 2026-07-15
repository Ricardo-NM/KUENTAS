import crypto from "node:crypto";
import * as OTPAuth from "otpauth";
import { getPrisma } from "@/lib/prisma";
import { normalizeEmail } from "./validation";

export const passwordResetOtpExpiresMs = 10 * 60 * 1000;
export const passwordResetSessionCookieName = "kuentas_password_reset";

type PasswordResetSessionPayload = {
  id: string;
  userId: string;
  expiresAt: string;
};

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

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return crypto
    .createHmac("sha256", getPasswordResetSecret())
    .update(payload)
    .digest("base64url");
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

function generatePasswordResetOtp() {
  const secret = OTPAuth.Secret.fromHex(crypto.randomBytes(20).toString("hex"));
  const otp = new OTPAuth.TOTP({
    issuer: "Kuentas",
    label: "Recuperacion de contrasena",
    algorithm: "SHA1",
    digits: 6,
    period: passwordResetOtpExpiresMs / 1000,
    secret,
  });

  return otp.generate();
}

export function hashPasswordResetOtp(code: string) {
  return crypto
    .createHmac("sha256", getPasswordResetSecret())
    .update(normalizeOtp(code))
    .digest("hex");
}

export function isPasswordResetOtpExpired(expiresAt: Date, now = new Date()) {
  return expiresAt <= now;
}

export async function createPasswordResetOtp(userId: string) {
  const code = generatePasswordResetOtp();
  const expiresAt = new Date(Date.now() + passwordResetOtpExpiresMs);
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
        tokenHash: hashPasswordResetOtp(code),
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

export async function verifyPasswordResetOtp(email: string, code: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: {
      email: normalizeEmail(email),
    },
    select: {
      id: true,
      passwordResetTokens: {
        where: {
          usedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          tokenHash: true,
          expiresAt: true,
          usedAt: true,
        },
      },
    },
  });
  const resetOtp = user?.passwordResetTokens[0];

  if (
    !user ||
    !resetOtp ||
    resetOtp.usedAt ||
    isPasswordResetOtpExpired(resetOtp.expiresAt) ||
    !timingSafeEqual(resetOtp.tokenHash, hashPasswordResetOtp(code))
  ) {
    return null;
  }

  const usedAt = new Date();

  await prisma.passwordResetToken.update({
    where: {
      id: resetOtp.id,
    },
    data: {
      usedAt,
    },
  });

  return {
    id: resetOtp.id,
    userId: user.id,
    expiresAt: resetOtp.expiresAt,
    usedAt,
  };
}

export function createPasswordResetSessionValue(
  payload: PasswordResetSessionPayload,
) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function parsePasswordResetSessionValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [encodedPayload, signature, ...extraParts] = value.split(".");

  if (!encodedPayload || !signature || extraParts.length > 0) {
    return null;
  }

  if (!timingSafeEqual(signature, signPayload(encodedPayload))) {
    return null;
  }

  try {
    const payload = JSON.parse(
      base64UrlDecode(encodedPayload),
    ) as PasswordResetSessionPayload;
    const expiresAt = new Date(payload.expiresAt);

    if (
      !payload.id ||
      !payload.userId ||
      Number.isNaN(expiresAt.getTime()) ||
      isPasswordResetOtpExpired(expiresAt)
    ) {
      return null;
    }

    return {
      ...payload,
      expiresAt,
    };
  } catch {
    return null;
  }
}

export async function verifyPasswordResetSession(value: string | undefined) {
  const payload = parsePasswordResetSessionValue(value);

  if (!payload) {
    return null;
  }

  const resetOtp = await getPrisma().passwordResetToken.findUnique({
    where: {
      id: payload.id,
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  if (
    !resetOtp ||
    resetOtp.userId !== payload.userId ||
    !resetOtp.usedAt ||
    isPasswordResetOtpExpired(resetOtp.expiresAt)
  ) {
    return null;
  }

  return {
    id: resetOtp.id,
    userId: resetOtp.userId,
  };
}
