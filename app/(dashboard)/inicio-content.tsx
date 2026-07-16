"use client";

import { useTranslation } from "react-i18next";

export function InicioContent() {
  const { t } = useTranslation();

  return (
    <section className="flex h-full min-h-[320px] items-center justify-center px-6 py-12 text-center">
      <h1 className="font-heading text-2xl font-semibold text-card-foreground sm:text-3xl">
        {t("inicio.title")}
      </h1>
    </section>
  );
}
