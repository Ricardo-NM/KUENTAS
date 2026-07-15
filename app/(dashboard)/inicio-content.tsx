"use client";

import { useTranslation } from "react-i18next";

export function InicioContent() {
  const { t } = useTranslation();

  return (
    <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#d8dadc] bg-[#f7f9fb] px-6 py-12 text-center shadow-[0_4px_6px_-1px_rgb(0_0_0/0.05),0_2px_4px_-2px_rgb(0_0_0/0.05)]">
      <h1 className="font-heading text-2xl font-semibold text-[#191c1e] sm:text-3xl">
        {t("inicio.title")}
      </h1>
    </section>
  );
}
