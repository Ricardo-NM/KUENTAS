"use client";

import {
  BellIcon,
  SearchIcon,
  type BellIconHandle,
  type SearchIconHandle,
} from "lucide-animated";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { DashboardUser } from "@/lib/dashboard/user";

export function DashboardTopbar({ user }: { user: DashboardUser }) {
  const { i18n, t } = useTranslation();
  const searchIconRef = useRef<SearchIconHandle>(null);
  const bellIconRef = useRef<BellIconHandle>(null);
  const isEnglish = i18n.language?.startsWith("en");
  const searchLabel = t("dashboard.topbar.searchLabel", {
    defaultValue: isEnglish ? "Search" : "Buscar",
  });
  const searchPlaceholder = t("dashboard.topbar.searchPlaceholder", {
    defaultValue: isEnglish ? "Search..." : "Buscar...",
  });
  const notificationsLabel = t("dashboard.topbar.notifications", {
    defaultValue: isEnglish ? "Notifications" : "Notificaciones",
  });

  const startSearchAnimation = () => searchIconRef.current?.startAnimation();
  const stopSearchAnimation = () => searchIconRef.current?.stopAnimation();
  const startBellAnimation = () => bellIconRef.current?.startAnimation();
  const stopBellAnimation = () => bellIconRef.current?.stopAnimation();

  return (
    <header className="mb-4 flex w-full flex-col gap-4 rounded-2xl border border-[#d8dadc] bg-[#f7f9fb] px-4 py-3 text-[#191c1e] shadow-[0_4px_6px_-1px_rgb(0_0_0/0.05),0_2px_4px_-2px_rgb(0_0_0/0.05)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <label className="group flex h-11 w-full items-center gap-3 rounded-xl bg-[#eceef0] px-4 text-[#47464b] transition-shadow focus-within:shadow-[0_0_0_2px_#0d0d12] sm:max-w-[380px]">
        <span className="sr-only">{searchLabel}</span>
        <SearchIcon
          ref={searchIconRef}
          aria-hidden="true"
          animateOnHover={false}
          className="shrink-0 text-[#47464b]"
          size={18}
        />
        <input
          type="search"
          placeholder={searchPlaceholder}
          onFocus={startSearchAnimation}
          onBlur={stopSearchAnimation}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#191c1e] outline-none placeholder:text-[#78767b]"
        />
      </label>

      <div className="flex min-w-0 items-center justify-end gap-4">
        <button
          type="button"
          aria-label={notificationsLabel}
          onFocus={startBellAnimation}
          onBlur={stopBellAnimation}
          onMouseEnter={startBellAnimation}
          onMouseLeave={stopBellAnimation}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-[#eceef0] text-[#191c1e] transition-colors hover:bg-[#e0e3e5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d12]"
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
            className="grid size-12 shrink-0 place-items-center rounded-full border border-[#d8dadc] bg-[#eceef0] font-heading text-lg font-bold text-[#191c1e]"
          >
            {user.initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-5 text-[#191c1e]">
              {user.name}
            </p>
            <p className="truncate text-xs leading-5 text-[#47464b]">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
