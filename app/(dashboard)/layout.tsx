import { requireSession } from "@/lib/auth/session";
import { getPrisma } from "@/lib/prisma";
import { formatDashboardUser } from "@/lib/dashboard/user";
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
    <div className="min-h-dvh bg-background text-on-surface lg:grid lg:grid-cols-[260px_1fr]">
      <DashboardSidebar />
      <main className="min-w-0 px-4 py-4 sm:px-6 lg:px-8">
        <DashboardTopbar user={formatDashboardUser(user)} />
        {children}
      </main>
    </div>
  );
}
