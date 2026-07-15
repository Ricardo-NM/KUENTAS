"use client";

import { useTranslation } from "react-i18next";
import { LogoutButton } from "./logout-button";

export function InicioContent() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12 text-foreground sm:px-8">
      <section className="grid w-full max-w-xl justify-items-center gap-6 rounded-2xl border border-border bg-surface px-6 py-10 text-center shadow-[0_4px_6px_-1px_rgb(0_0_0/0.05),0_2px_4px_-2px_rgb(0_0_0/0.05)] sm:px-10 sm:py-12">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {t("inicio.title")}
        </h1>
        <LogoutButton />
      </section>
    </main>
  );
}
