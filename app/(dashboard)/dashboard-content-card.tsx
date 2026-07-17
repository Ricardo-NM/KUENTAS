export function DashboardContentCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-[0_4px_6px_-1px_rgb(0_0_0/0.05),0_2px_4px_-2px_rgb(0_0_0/0.05)] sm:p-5 lg:p-6">
      {children}
    </section>
  );
}
