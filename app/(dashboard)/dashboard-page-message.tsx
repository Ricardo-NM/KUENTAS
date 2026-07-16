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
    <section className="flex h-full min-h-[320px] w-full items-center justify-center px-4 py-10 text-center sm:px-5">
      <h1 className="font-heading text-2xl font-semibold text-card-foreground sm:text-3xl">
        {t("dashboard.greeting", { section: sectionName })}
      </h1>
    </section>
  );
}
