"use client";

import Image from "next/image";
import {
  BellIcon,
  type BellIconHandle,
  PlusIcon,
  type PlusIconHandle,
} from "lucide-animated";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { DashboardUser } from "@/lib/dashboard/user";

export function DashboardTopbar({ user }: { user: DashboardUser }) {
  const { i18n, t } = useTranslation();
  const pendingPaymentIconRef = useRef<PlusIconHandle>(null);
  const bellIconRef = useRef<BellIconHandle>(null);
  const isEnglish = i18n.language?.startsWith("en");
  const pendingPaymentLabel = t("inicio.pendingPayment", {
    defaultValue: isEnglish ? "Pending payment" : "Pago pendiente",
  });
  const notificationsLabel = t("dashboard.topbar.notifications", {
    defaultValue: isEnglish ? "Notifications" : "Notificaciones",
  });

  const startPendingPaymentAnimation = () =>
    pendingPaymentIconRef.current?.startAnimation();
  const stopPendingPaymentAnimation = () =>
    pendingPaymentIconRef.current?.stopAnimation();
  const startBellAnimation = () => bellIconRef.current?.startAnimation();
  const stopBellAnimation = () => bellIconRef.current?.stopAnimation();

  return (
    <header className="mb-4 flex w-full flex-col gap-4 rounded-2xl border border-border bg-card px-4 py-3 text-card-foreground shadow-[0_4px_6px_-1px_rgb(0_0_0/0.05),0_2px_4px_-2px_rgb(0_0_0/0.05)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <button
        type="button"
        onFocus={startPendingPaymentAnimation}
        onBlur={stopPendingPaymentAnimation}
        onMouseEnter={startPendingPaymentAnimation}
        onMouseLeave={stopPendingPaymentAnimation}
        className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_4px_6px_-1px_rgb(0_0_0/0.08),0_2px_4px_-2px_rgb(0_0_0/0.08)] transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto sm:min-w-[180px]"
      >
        <PlusIcon
          ref={pendingPaymentIconRef}
          aria-hidden="true"
          animateOnHover={false}
          className="shrink-0"
          size={18}
        />
        <span>{pendingPaymentLabel}</span>
      </button>

      <div className="flex min-w-0 items-center justify-end gap-4">
        <button
          type="button"
          aria-label={notificationsLabel}
          onFocus={startBellAnimation}
          onBlur={stopBellAnimation}
          onMouseEnter={startBellAnimation}
          onMouseLeave={stopBellAnimation}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-surface-container text-on-surface transition-colors hover:bg-surface-container-highest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <BellIcon
            ref={bellIconRef}
            aria-hidden="true"
            animateOnHover={false}
            size={18}
          />
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <div
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-surface-container font-heading text-lg font-bold text-on-surface"
          >
            {user.profileImagePath ? (
              <Image
                src={user.profileImagePath}
                alt=""
                width={48}
                height={48}
                unoptimized
                className="size-full object-cover"
              />
            ) : (
              user.initial
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-5 text-on-surface">
              {user.name}
            </p>
            <p className="truncate text-xs leading-5 text-on-surface-variant">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
