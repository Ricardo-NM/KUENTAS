import crypto from "node:crypto";
import * as OTPAuth from "otpauth";
import { getPrisma } from "@/lib/prisma";
import { normalizeEmail } from "./validation";

export const accountVerificationOtpExpiresMs = 10 * 60 * 1000;

function getAccountVerificationSecret() {
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

function generateAccountVerificationOtp() {
  const secret = OTPAuth.Secret.fromHex(crypto.randomBytes(20).toString("hex"));
  const otp = new OTPAuth.TOTP({
    issuer: "Kuentas",
    label: "Creacion de cuenta",
    algorithm: "SHA1",
    digits: 6,
    period: accountVerificationOtpExpiresMs / 1000,
    secret,
  });

  return otp.generate();
}

export function hashAccountVerificationOtp(code: string) {
  return crypto
    .createHmac("sha256", getAccountVerificationSecret())
    .update(normalizeOtp(code))
    .digest("hex");
}

export function isAccountVerificationOtpExpired(
  expiresAt: Date,
  now = new Date(),
) {
  return expiresAt <= now;
}

export async function createAccountVerificationOtp(userId: string) {
  const code = generateAccountVerificationOtp();
  const expiresAt = new Date(Date.now() + accountVerificationOtpExpiresMs);
  const verificationOtp = await getPrisma().accountVerificationToken.create({
    data: {
      userId,
      tokenHash: hashAccountVerificationOtp(code),
      expiresAt,
    },
    select: {
      id: true,
    },
  });

  return {
    id: verificationOtp.id,
    code,
    expiresAt,
  };
}

export async function discardAccountVerificationOtp(id: string) {
  await getPrisma().accountVerificationToken.delete({
    where: {
      id,
    },
  });
}

export async function invalidatePreviousAccountVerificationOtps(
  userId: string,
  currentOtpId: string,
) {
  await getPrisma().accountVerificationToken.updateMany({
    where: {
      userId,
      id: {
        not: currentOtpId,
      },
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
}

export async function verifyAccountVerificationOtp(
  email: string,
  code: string,
) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: {
      email: normalizeEmail(email),
    },
    select: {
      id: true,
      emailVerifiedAt: true,
      accountVerificationTokens: {
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
  const verificationOtp = user?.accountVerificationTokens[0];

  if (
    !user ||
    user.emailVerifiedAt ||
    !verificationOtp ||
    verificationOtp.usedAt ||
    isAccountVerificationOtpExpired(verificationOtp.expiresAt) ||
    !timingSafeEqual(
      verificationOtp.tokenHash,
      hashAccountVerificationOtp(code),
    )
  ) {
    return null;
  }

  const verifiedAt = new Date();

  await prisma.$transaction([
    prisma.accountVerificationToken.update({
      where: {
        id: verificationOtp.id,
      },
      data: {
        usedAt: verifiedAt,
      },
    }),
    prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerifiedAt: verifiedAt,
      },
    }),
  ]);

  return {
    id: verificationOtp.id,
    userId: user.id,
    verifiedAt,
  };
}
