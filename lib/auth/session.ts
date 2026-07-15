import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getClientIpFromHeaders, hashClientIp } from "@/lib/auth/rate-limit";
import { getPrisma } from "@/lib/prisma";

const sessionCookieName = "kuentas_session";
const shortSessionMs = 8 * 60 * 60 * 1000;
const rememberedSessionMs = 30 * 24 * 60 * 60 * 1000;

export type SessionRequestMetadata = {
  userAgent: string | null;
  deviceLabel: string;
  ipHash: string;
};

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

export function getSessionDeviceLabel(userAgent: string | null) {
  if (!userAgent) {
    return "Dispositivo desconocido";
  }

  const normalizedUserAgent = userAgent.toLowerCase();
  const platform = normalizedUserAgent.includes("iphone")
    ? "iPhone"
    : normalizedUserAgent.includes("ipad")
      ? "iPad"
      : normalizedUserAgent.includes("android")
        ? "Android"
        : normalizedUserAgent.includes("windows")
          ? "Windows"
          : normalizedUserAgent.includes("mac os x") ||
              normalizedUserAgent.includes("macintosh")
            ? "macOS"
            : normalizedUserAgent.includes("linux")
              ? "Linux"
              : "Dispositivo";
  const browser = normalizedUserAgent.includes("edg/")
    ? "Edge"
    : normalizedUserAgent.includes("firefox/")
      ? "Firefox"
      : normalizedUserAgent.includes("crios/")
        ? "Chrome"
        : normalizedUserAgent.includes("chrome/")
          ? "Chrome"
          : normalizedUserAgent.includes("safari/")
            ? "Safari"
            : "Navegador";

  return `${platform} - ${browser}`;
}

export function getSessionRequestMetadata(
  headersList: Headers,
): SessionRequestMetadata {
  const userAgent = headersList.get("user-agent");

  return {
    userAgent,
    deviceLabel: getSessionDeviceLabel(userAgent),
    ipHash: hashClientIp(getClientIpFromHeaders(headersList)),
  };
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

export async function createSession(
  userId: string,
  remember: boolean,
  metadata?: SessionRequestMetadata,
) {
  const prisma = getPrisma();
  const token = generateSessionToken();
  const requestMetadata =
    metadata ?? getSessionRequestMetadata(await headers());
  const expiresAt = new Date(
    Date.now() + (remember ? rememberedSessionMs : shortSessionMs),
  );

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      userAgent: requestMetadata.userAgent,
      deviceLabel: requestMetadata.deviceLabel,
      ipHash: requestMetadata.ipHash,
      lastSeenAt: new Date(),
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

  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      lastSeenAt: new Date(),
    },
    select: {
      id: true,
    },
  });

  return {
    sessionId: session.id,
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
