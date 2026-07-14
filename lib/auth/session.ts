import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";

const sessionCookieName = "kuentas_session";
const shortSessionMs = 8 * 60 * 60 * 1000;
const rememberedSessionMs = 30 * 24 * 60 * 60 * 1000;

export function buildSessionCookieValue(sessionId: string, token: string) {
  return `${sessionId}.${token}`;
}

export function parseSessionCookieValue(value: string) {
  const parts = value.split(".");

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }

  return {
    sessionId: parts[0],
    token: parts[1],
  };
}

function getSessionSecret() {
  const configuredSecret = process.env.SESSION_SECRET;

  if (configuredSecret && configuredSecret.length >= 32) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }

  return "development-session-secret-at-least-32-chars";
}

export function hashSessionToken(token: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(token)
    .digest("hex");
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function getCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

export async function createSession(userId: string, remember: boolean) {
  const prisma = getPrisma();
  const token = generateSessionToken();
  const expiresAt = new Date(
    Date.now() + (remember ? rememberedSessionMs : shortSessionMs),
  );

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
    select: {
      id: true,
    },
  });

  const cookieValue = buildSessionCookieValue(session.id, token);
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, cookieValue, getCookieOptions(expiresAt));

  return {
    cookieValue,
    expiresAt,
  };
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(sessionCookieName)?.value;

  if (!cookieValue) {
    return null;
  }

  const parsedCookie = parseSessionCookieValue(cookieValue);

  if (!parsedCookie) {
    cookieStore.delete(sessionCookieName);
    return null;
  }

  const prisma = getPrisma();
  const session = await prisma.session.findUnique({
    where: {
      id: parsedCookie.sessionId,
    },
    select: {
      id: true,
      userId: true,
      tokenHash: true,
      expiresAt: true,
    },
  });

  if (!session) {
    cookieStore.delete(sessionCookieName);
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });
    cookieStore.delete(sessionCookieName);
    return null;
  }

  if (session.tokenHash !== hashSessionToken(parsedCookie.token)) {
    cookieStore.delete(sessionCookieName);
    return null;
  }

  return {
    userId: session.userId,
  };
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(sessionCookieName)?.value;
  const parsedCookie = cookieValue ? parseSessionCookieValue(cookieValue) : null;

  if (parsedCookie) {
    await getPrisma().session.deleteMany({
      where: {
        id: parsedCookie.sessionId,
      },
    });
  }

  cookieStore.delete(sessionCookieName);
}

export async function requireSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
