"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BellIcon,
  CalendarCheckIcon,
  ChartPieIcon,
  ChevronDownIcon,
  CogIcon,
  HandCoinsIcon,
  LayoutGridIcon,
  LogoutIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UserRoundCogIcon,
} from "lucide-animated";
import { AnimatePresence, motion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type ForwardRefExoticComponent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type RefAttributes,
  useEffect,
  useRef,
  useState,
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
  dashboardSettingsSectionParamName,
  dashboardSettingsSections,
  getDashboardSettingsSectionHref,
  isDashboardSettingsSectionId,
  type DashboardSettingsIcon,
  type DashboardSettingsSection,
  type DashboardSettingsSectionId,
} from "@/lib/dashboard/settings";
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

const settingsIcons: Record<DashboardSettingsIcon, AnimatedIcon> = {
  cog: CogIcon,
  "user-round-cog": UserRoundCogIcon,
  bell: BellIcon,
  "shield-check": ShieldCheckIcon,
};

const navItemBySection = new Map(
  dashboardNavItems.map((item) => [item.section, item]),
);

function isPlainPrimaryNavigationEvent(
  event: MouseEvent<HTMLAnchorElement> | PointerEvent<HTMLAnchorElement>,
) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function SidebarNavItem({
  href,
  icon,
  isActive,
  onNavigate,
  section,
}: {
  href: string;
  icon: keyof typeof icons;
  isActive: boolean;
  onNavigate: (href: string) => void;
  section: DashboardSection;
}) {
  const { t } = useTranslation();
  const iconRef = useRef<AnimatedIconHandle>(null);
  const animationTimeoutRef = useRef<number | null>(null);
  const wasActiveRef = useRef(isActive);
  const Icon = icons[icon];

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const becameActive = isActive && !wasActiveRef.current;

    wasActiveRef.current = isActive;

    if (!becameActive) {
      return;
    }

    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
    }

    iconRef.current?.startAnimation();
    animationTimeoutRef.current = window.setTimeout(() => {
      iconRef.current?.stopAnimation();
      animationTimeoutRef.current = null;
    }, 700);
  }, [isActive]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || !isPlainPrimaryNavigationEvent(event)) {
      return;
    }

    onNavigate(href);
  };

  const handlePointerDown = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || !isPlainPrimaryNavigationEvent(event)) {
      return;
    }

    onNavigate(href);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.key !== "Enter") {
      return;
    }

    onNavigate(href);
  };

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
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
            className="absolute inset-0 origin-left rounded-lg bg-primary will-change-transform"
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

function SidebarSettingsSubItem({
  isActive,
  onNavigate,
  section,
}: {
  isActive: boolean;
  onNavigate: (href: string) => void;
  section: DashboardSettingsSection;
}) {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const href = getDashboardSettingsSectionHref(section.id);
  const iconRef = useRef<AnimatedIconHandle>(null);
  const animationTimeoutRef = useRef<number | null>(null);
  const Icon = settingsIcons[section.icon];

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
    }

    iconRef.current?.startAnimation();
    animationTimeoutRef.current = window.setTimeout(() => {
      iconRef.current?.stopAnimation();
      animationTimeoutRef.current = null;
    }, 700);
  }, [isActive]);

  const stopIconAnimation = () => {
    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    iconRef.current?.stopAnimation();
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || !isPlainPrimaryNavigationEvent(event)) {
      return;
    }

    onNavigate(href);
  };

  const handlePointerDown = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || !isPlainPrimaryNavigationEvent(event)) {
      return;
    }

    onNavigate(href);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.key !== "Enter") {
      return;
    }

    onNavigate(href);
  };

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onFocus={() => iconRef.current?.startAnimation()}
      onBlur={stopIconAnimation}
      className={cn(
        "group relative flex min-h-9 items-center gap-2.5 rounded-md py-2 pl-3 pr-3 text-sm font-semibold leading-5 transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        isActive
          ? "bg-surface-container-highest text-primary"
          : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface",
      )}
    >
      <Icon
        ref={iconRef}
        aria-hidden="true"
        animateOnHover={false}
        className="relative z-10 shrink-0"
        size={19}
      />
      <span className="relative z-10 min-w-0 truncate">
        {t(section.labelKey, {
          defaultValue: section.fallbackLabels[language],
        })}
      </span>
    </Link>
  );
}

function SidebarSettingsItem({
  activeSectionId,
  isActive,
  isOpen,
  onNavigate,
  onToggle,
}: {
  activeSectionId: DashboardSettingsSectionId;
  isActive: boolean;
  isOpen: boolean;
  onNavigate: (href: string) => void;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const iconRef = useRef<AnimatedIconHandle>(null);
  const animationTimeoutRef = useRef<number | null>(null);
  const wasActiveRef = useRef(isActive);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const becameActive = isActive && !wasActiveRef.current;

    wasActiveRef.current = isActive;

    if (!becameActive) {
      return;
    }

    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
    }

    iconRef.current?.startAnimation();
    animationTimeoutRef.current = window.setTimeout(() => {
      iconRef.current?.stopAnimation();
      animationTimeoutRef.current = null;
    }, 700);
  }, [isActive]);

  const handleToggle = () => {
    onToggle();
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="sidebar-settings-submenu"
        onClick={handleToggle}
        className={cn(
          "group relative flex min-h-11 w-full cursor-pointer items-center gap-3 overflow-hidden rounded-lg px-3 text-left text-sm font-semibold transition-colors",
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
              className="absolute inset-0 origin-left rounded-lg bg-primary will-change-transform"
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
        <SettingsIcon
          ref={iconRef}
          animateOnHover={false}
          className="relative z-10 shrink-0"
          size={19}
        />
        <span className="relative z-10 min-w-0 flex-1 truncate">
          {t("dashboard.navigation.configuracion")}
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          animateOnHover={false}
          className={cn(
            "relative z-10 shrink-0 transition-transform",
            isOpen ? "rotate-180" : "rotate-0",
          )}
          size={16}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id="sidebar-settings-submenu"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="space-y-1 py-1">
              {dashboardSettingsSections.map((section) => (
                <SidebarSettingsSubItem
                  key={section.id}
                  section={section}
                  isActive={isActive && activeSectionId === section.id}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function LogoutSubmitButton() {
  const { t } = useTranslation();
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-[0_4px_6px_-1px_rgb(0_0_0/0.08),0_2px_4px_-2px_rgb(0_0_0/0.08)] transition-colors hover:bg-inverse-surface hover:text-inverse-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogoutIcon
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendingNavigation, setPendingNavigation] = useState<{
    href: string;
    pathname: string;
  } | null>(null);
  const [settingsMenuMode, setSettingsMenuMode] = useState<
    "auto" | "open" | "closed"
  >("auto");
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const currentSearch = searchParams.toString();
  const currentUrl = `${pathname}${currentSearch ? `?${currentSearch}` : ""}`;

  useEffect(() => {
    if (pendingNavigation?.href !== currentUrl) {
      return;
    }

    const clearPendingNavigation = window.setTimeout(() => {
      setPendingNavigation(null);
    }, 0);

    return () => {
      window.clearTimeout(clearPendingNavigation);
    };
  }, [currentUrl, pendingNavigation?.href]);

  const activeHref =
    pendingNavigation?.pathname === pathname && pendingNavigation.href !== currentUrl
      ? pendingNavigation.href
      : currentUrl;
  const activePathname = activeHref.split("?")[0];
  const activeSearch = activeHref.includes("?")
    ? activeHref.slice(activeHref.indexOf("?") + 1)
    : "";
  const activeSearchParams = new URLSearchParams(activeSearch);
  const activeSettingsSectionParam = activeSearchParams.get(
    dashboardSettingsSectionParamName,
  );
  const activeSettingsSectionId = isDashboardSettingsSectionId(
    activeSettingsSectionParam,
  )
    ? activeSettingsSectionParam
    : "general";
  const isSettingsMenuOpen =
    settingsMenuMode === "open" ||
    (settingsMenuMode === "auto" && activePathname === "/configuracion");

  return (
    <aside className="flex min-h-dvh w-full flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground shadow-[8px_0_24px_-22px_rgb(13_13_18/0.55)] lg:sticky lg:top-0 lg:h-dvh lg:min-h-0 lg:w-[260px] lg:self-start lg:overflow-hidden">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid size-9 place-items-center rounded-lg bg-primary font-heading text-sm font-bold text-primary-foreground">
          K
        </div>
        <span className="font-heading text-base font-bold tracking-normal">
          {t("common.appName")}
        </span>
      </div>

      <nav
        aria-label={t("dashboard.navigationLabel")}
        className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1"
      >
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

                if (item?.section === "configuracion") {
                  return (
                    <SidebarSettingsItem
                      key={item.href}
                      isActive={activePathname === item.href}
                      isOpen={isSettingsMenuOpen}
                      activeSectionId={activeSettingsSectionId}
                      onToggle={() => {
                        setSettingsMenuMode(
                          isSettingsMenuOpen ? "closed" : "open",
                        );
                      }}
                      onNavigate={(href) => {
                        setSettingsMenuMode("auto");
                        setPendingNavigation({ href, pathname });
                      }}
                    />
                  );
                }

                return item ? (
                  <SidebarNavItem
                    key={item.href}
                    {...item}
                    isActive={activePathname === item.href}
                    onNavigate={(href) => {
                      setSettingsMenuMode("auto");
                      setPendingNavigation({ href, pathname });
                    }}
                  />
                ) : null;
              })}
            </div>
          </section>
        ))}
      </nav>

      <form action={logoutAction} className="shrink-0 pt-6">
        <LogoutSubmitButton />
      </form>
    </aside>
  );
}
