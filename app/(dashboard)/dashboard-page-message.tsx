"use client";

import { useTranslation } from "react-i18next";
import type { DashboardSection } from "@/lib/dashboard/navigation";

export function DashboardPageMessage({
  section,
}: {
  section: DashboardSection;
}) {
  const { t } = useTranslation();
  const sectionName = t(`dashboard.navigation.${section}`);

  return (
    <section className="flex min-h-[320px] w-full items-center justify-center rounded-2xl border border-border bg-card px-4 py-10 text-center shadow-[0_4px_6px_-1px_rgb(0_0_0/0.05),0_2px_4px_-2px_rgb(0_0_0/0.05)] sm:px-5">
      <h1 className="font-heading text-2xl font-semibold text-card-foreground sm:text-3xl">
        {t("dashboard.greeting", { section: sectionName })}
      </h1>
    </section>
  );
}
