"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheckIcon,
  ChartPieIcon,
  HandCoinsIcon,
  LayoutGridIcon,
  LogoutIcon,
  SettingsIcon,
} from "lucide-animated";
import { AnimatePresence, motion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
  useRef,
} from "react";
import { useFormStatus } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  dashboardNavGroupFallbackLabels,
  dashboardNavGroups,
  dashboardNavItems,
  type DashboardSection,
} from "@/lib/dashboard/navigation";
import {
  dashboardActiveIndicatorSweepStates,
  dashboardActiveIndicatorSweepTransition,
} from "@/lib/dashboard/theme";
import { cn } from "@/lib/utils";
import { logoutAction } from "./actions";

type AnimatedIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type AnimatedIcon = ForwardRefExoticComponent<
  ComponentPropsWithoutRef<"div"> & {
    size?: number;
    animateOnHover?: boolean;
  } & RefAttributes<AnimatedIconHandle>
>;

const icons: Record<(typeof dashboardNavItems)[number]["icon"], AnimatedIcon> = {
  "layout-grid": LayoutGridIcon,
  "calendar-check": CalendarCheckIcon,
  "hand-coins": HandCoinsIcon,
  "chart-pie": ChartPieIcon,
  settings: SettingsIcon,
};

const navItemBySection = new Map(
  dashboardNavItems.map((item) => [item.section, item]),
);

function SidebarNavItem({
  href,
  icon,
  section,
}: {
  href: string;
  icon: keyof typeof icons;
  section: DashboardSection;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const iconRef = useRef<AnimatedIconHandle>(null);
  const Icon = icons[icon];
  const isActive = pathname === href;

  const startAnimation = () => iconRef.current?.startAnimation();
  const stopAnimation = () => iconRef.current?.stopAnimation();

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onFocus={startAnimation}
      onBlur={stopAnimation}
      onMouseEnter={startAnimation}
      onMouseLeave={stopAnimation}
      className={cn(
        "group relative flex min-h-11 items-center gap-3 overflow-hidden rounded-lg px-3 text-sm font-semibold transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        isActive
          ? "text-primary-foreground shadow-[0_4px_6px_-1px_rgb(0_0_0/0.08),0_2px_4px_-2px_rgb(0_0_0/0.08)]"
          : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface",
      )}
    >
      <AnimatePresence initial={false}>
        {isActive ? (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-lg bg-primary"
            initial={dashboardActiveIndicatorSweepStates.initial}
            animate={dashboardActiveIndicatorSweepStates.animate}
            exit={dashboardActiveIndicatorSweepStates.exit}
            transition={dashboardActiveIndicatorSweepTransition}
          />
        ) : null}
      </AnimatePresence>
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-2 z-10 h-7 w-1 rounded-r-full transition-opacity",
          isActive
            ? "bg-primary-foreground opacity-100"
            : "bg-transparent opacity-0",
        )}
      />
      <Icon
        ref={iconRef}
        animateOnHover={false}
        className="relative z-10"
        size={19}
      />
      <span className="relative z-10">{t(`dashboard.navigation.${section}`)}</span>
    </Link>
  );
}

function LogoutSubmitButton() {
  const { t } = useTranslation();
  const { pending } = useFormStatus();
  const iconRef = useRef<AnimatedIconHandle>(null);

  const startAnimation = () => iconRef.current?.startAnimation();
  const stopAnimation = () => iconRef.current?.stopAnimation();

  return (
    <button
      type="submit"
      disabled={pending}
      onFocus={startAnimation}
      onBlur={stopAnimation}
      onMouseEnter={startAnimation}
      onMouseLeave={stopAnimation}
      className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-[0_4px_6px_-1px_rgb(0_0_0/0.08),0_2px_4px_-2px_rgb(0_0_0/0.08)] transition-colors hover:bg-inverse-surface hover:text-inverse-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogoutIcon
        ref={iconRef}
        aria-hidden="true"
        animateOnHover={false}
        size={19}
      />
      <span>{pending ? t("dashboard.loggingOut") : t("dashboard.logout")}</span>
    </button>
  );
}

export function DashboardSidebar() {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";

  return (
    <aside className="flex min-h-dvh w-full flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground shadow-[8px_0_24px_-22px_rgb(13_13_18/0.55)] lg:sticky lg:top-0 lg:w-[260px]">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid size-9 place-items-center rounded-lg bg-primary font-heading text-sm font-bold text-primary-foreground">
          K
        </div>
        <span className="font-heading text-base font-bold tracking-normal">
          {t("common.appName")}
        </span>
      </div>

      <nav aria-label={t("dashboard.navigationLabel")} className="space-y-6">
        {dashboardNavGroups.map((group, index) => (
          <section key={group.id} className="space-y-3">
            {index > 0 ? (
              <div
                aria-hidden="true"
                className="mx-3 h-px rounded-full bg-outline/35"
              />
            ) : null}
            <p className="px-3 text-[11px] font-semibold uppercase leading-4 tracking-normal text-outline">
              {t(`dashboard.groups.${group.id}`, {
                defaultValue: dashboardNavGroupFallbackLabels[group.id][language],
              })}
            </p>
            <div className="space-y-1">
              {group.sections.map((section) => {
                const item = navItemBySection.get(section);

                return item ? (
                  <SidebarNavItem key={item.href} {...item} />
                ) : null;
              })}
            </div>
          </section>
        ))}
      </nav>

      <form action={logoutAction} className="mt-auto pt-6">
        <LogoutSubmitButton />
      </form>
    </aside>
  );
}
