import { ConfiguracionSettingsView } from "./settings-view";
import { requireSession } from "@/lib/auth/session";
import { getPrisma } from "@/lib/prisma";

export default async function ConfiguracionPage() {
  const session = await requireSession();
  const user = await getPrisma().user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      profileImagePath: true,
    },
  });

  if (!user) {
    throw new Error("Authenticated user was not found.");
  }

  const activeSessions = await getPrisma().session.findMany({
    where: {
      userId: session.userId,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: [
      {
        lastSeenAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      deviceLabel: true,
      lastSeenAt: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  return (
    <ConfiguracionSettingsView
      user={user}
      sessions={activeSessions.map((activeSession) => ({
        id: activeSession.id,
        deviceLabel: activeSession.deviceLabel,
        lastSeenAt: activeSession.lastSeenAt.toISOString(),
        createdAt: activeSession.createdAt.toISOString(),
        expiresAt: activeSession.expiresAt.toISOString(),
        isCurrent: activeSession.id === session.sessionId,
      }))}
    />
  );
}
