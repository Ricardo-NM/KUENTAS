import crypto from "node:crypto";
import { getPrisma } from "@/lib/prisma";

export const maxFailedLoginAttempts = 5;
export const failedLoginBlockMs = 15 * 60 * 1000;

type LoginAttemptState = {
  failedCount: number;
  blockedUntil: Date | null;
};

type LoginRateLimitTarget = {
  key: string;
  email: string | null;
  ipHash: string | null;
  scope: "email" | "ip" | "email_ip";
};

function getRateLimitSecret() {
  const configuredSecret = process.env.SESSION_SECRET;

  if (configuredSecret && configuredSecret.length >= 32) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }

  return "development-session-secret-at-least-32-chars";
}

export function getClientIpFromHeaders(headersList: Headers) {
  const forwardedFor = headersList.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    headersList.get("x-real-ip") ??
    headersList.get("cf-connecting-ip") ??
    "unknown"
  );
}

export function hashClientIp(ipAddress: string) {
  return crypto
    .createHmac("sha256", getRateLimitSecret())
    .update(ipAddress)
    .digest("hex");
}

export function getLoginRateLimitTargets(
  email: string,
  ipHash: string,
): LoginRateLimitTarget[] {
  return [
    {
      key: `login:email:${email}`,
      email,
      ipHash: null,
      scope: "email",
    },
    {
      key: `login:ip:${ipHash}`,
      email: null,
      ipHash,
      scope: "ip",
    },
    {
      key: `login:email-ip:${email}:${ipHash}`,
      email,
      ipHash,
      scope: "email_ip",
    },
  ];
}

export function isBlockedLoginAttempt(
  attempt: Pick<LoginAttemptState, "blockedUntil"> | null | undefined,
  now = new Date(),
) {
  return Boolean(attempt?.blockedUntil && attempt.blockedUntil > now);
}

export function getNextFailedLoginState(
  attempt: LoginAttemptState | null | undefined,
  now = new Date(),
): LoginAttemptState {
  const failedCount = (attempt?.failedCount ?? 0) + 1;

  return {
    failedCount,
    blockedUntil:
      failedCount >= maxFailedLoginAttempts
        ? new Date(now.getTime() + failedLoginBlockMs)
        : null,
  };
}

export async function isLoginBlocked(email: string, ipHash: string) {
  const prisma = getPrisma();
  const targets = getLoginRateLimitTargets(email, ipHash);
  const attempts = await prisma.loginAttempt.findMany({
    where: {
      key: {
        in: targets.map((target) => target.key),
      },
    },
    select: {
      key: true,
      blockedUntil: true,
    },
  });

  if (attempts.some((attempt) => isBlockedLoginAttempt(attempt))) {
    return true;
  }

  const expiredBlockedKeys = attempts
    .filter((attempt) => attempt.blockedUntil)
    .map((attempt) => attempt.key);

  if (expiredBlockedKeys.length > 0) {
    await prisma.loginAttempt.deleteMany({
      where: {
        key: {
          in: expiredBlockedKeys,
        },
      },
    });
  }

  return false;
}

export async function recordFailedLoginAttempt(email: string, ipHash: string) {
  const prisma = getPrisma();
  const targets = getLoginRateLimitTargets(email, ipHash);

  await Promise.all(
    targets.map(async (target) => {
      const attempt = await prisma.loginAttempt.findUnique({
        where: {
          key: target.key,
        },
        select: {
          failedCount: true,
          blockedUntil: true,
        },
      });
      const nextAttempt = getNextFailedLoginState(attempt);

      await prisma.loginAttempt.upsert({
        where: {
          key: target.key,
        },
        create: {
          key: target.key,
          email: target.email,
          ipHash: target.ipHash,
          scope: target.scope,
          failedCount: nextAttempt.failedCount,
          blockedUntil: nextAttempt.blockedUntil,
        },
        update: {
          failedCount: nextAttempt.failedCount,
          blockedUntil: nextAttempt.blockedUntil,
        },
      });
    }),
  );
}

export async function clearFailedLoginAttempts(email: string, ipHash: string) {
  const targets = getLoginRateLimitTargets(email, ipHash);

  await getPrisma().loginAttempt.deleteMany({
    where: {
      key: {
        in: targets.map((target) => target.key),
      },
    },
  });
}
