import { getPrisma } from "@/lib/prisma";

export const maxFailedLoginAttempts = 5;
export const failedLoginBlockMs = 15 * 60 * 1000;

type LoginAttemptState = {
  failedCount: number;
  blockedUntil: Date | null;
};

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

export async function isLoginBlocked(email: string) {
  const prisma = getPrisma();
  const attempt = await prisma.loginAttempt.findUnique({
    where: {
      email,
    },
    select: {
      blockedUntil: true,
    },
  });

  if (!attempt) {
    return false;
  }

  if (isBlockedLoginAttempt(attempt)) {
    return true;
  }

  if (attempt.blockedUntil) {
    await prisma.loginAttempt.deleteMany({
      where: {
        email,
      },
    });
  }

  return false;
}

export async function recordFailedLoginAttempt(email: string) {
  const prisma = getPrisma();
  const attempt = await prisma.loginAttempt.findUnique({
    where: {
      email,
    },
    select: {
      failedCount: true,
      blockedUntil: true,
    },
  });
  const nextAttempt = getNextFailedLoginState(attempt);

  await prisma.loginAttempt.upsert({
    where: {
      email,
    },
    create: {
      email,
      failedCount: nextAttempt.failedCount,
      blockedUntil: nextAttempt.blockedUntil,
    },
    update: {
      failedCount: nextAttempt.failedCount,
      blockedUntil: nextAttempt.blockedUntil,
    },
  });
}

export async function clearFailedLoginAttempts(email: string) {
  await getPrisma().loginAttempt.deleteMany({
    where: {
      email,
    },
  });
}
