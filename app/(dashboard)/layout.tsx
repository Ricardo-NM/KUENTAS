import { requireSession } from "@/lib/auth/session";
import { getPrisma } from "@/lib/prisma";
import { formatDashboardUser } from "@/lib/dashboard/user";
import { DashboardContentCard } from "./dashboard-content-card";
import { DashboardSidebar } from "./sidebar";
import { DashboardTopbar } from "./topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="min-h-dvh bg-background text-on-surface lg:grid lg:h-dvh lg:grid-cols-[260px_1fr] lg:overflow-hidden">
      <DashboardSidebar />
      <main className="flex min-h-dvh min-w-0 flex-col px-4 py-4 sm:px-6 lg:h-dvh lg:min-h-0 lg:overflow-hidden lg:px-8">
        <DashboardTopbar user={formatDashboardUser(user)} />
        <DashboardContentCard>{children}</DashboardContentCard>
      </main>
    </div>
  );
}
