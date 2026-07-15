"use client";

import {
  ChevronDownIcon,
  MoonIcon,
  SunMediumIcon,
  type MoonIconHandle,
  type SunMediumIconHandle,
  BellIcon,
  CogIcon,
  ShieldCheckIcon,
  UserRoundCogIcon,
} from "lucide-animated";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
  useRef,
  useState,
} from "react";
import {
  dashboardCurrencyOptions,
  dashboardSettingsFallbackCopy,
  dashboardSettingsSections,
  type DashboardSettingsIcon,
  type DashboardSettingsSection,
  type DashboardSettingsSectionId,
} from "@/lib/dashboard/settings";
import { isSupportedLanguage } from "@/lib/i18n/resources";
import {
  dashboardActiveIndicatorSweepStates,
  dashboardActiveIndicatorSweepTransition,
} from "@/lib/dashboard/theme";
import {
  applyDashboardTheme,
  dashboardThemeStorageKey,
  resolveDashboardTheme,
  type DashboardTheme,
} from "@/lib/dashboard/theme-preference";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

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

const settingsIcons: Record<DashboardSettingsIcon, AnimatedIcon> = {
  cog: CogIcon,
  "user-round-cog": UserRoundCogIcon,
  bell: BellIcon,
  "shield-check": ShieldCheckIcon,
};

type SelectOption = {
  value: string;
  label: string;
};

function SettingsSelect({
  ariaLabel,
  id,
  onChange,
  options,
  value,
}: {
  ariaLabel: string;
  id: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  value: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value) ??
    options[0];

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-3.5 pr-3 text-left text-sm font-semibold text-on-surface shadow-[0_1px_2px_rgb(13_13_18/0.04)] outline-none transition hover:border-outline hover:bg-surface focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
      >
        <span className="min-w-0 truncate">{selectedOption.label}</span>
        <ChevronDownIcon
          aria-hidden="true"
          animateOnHover={false}
          className={cn(
            "shrink-0 text-on-surface-variant transition-transform",
            isOpen ? "rotate-180" : "rotate-0",
          )}
          size={17}
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            role="listbox"
            aria-labelledby={id}
            className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-outline-variant bg-popover p-1 text-popover-foreground shadow-[0_18px_40px_rgb(13_13_18/0.16)]"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex min-h-10 w-full cursor-pointer items-center rounded-md px-3 text-left text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "text-on-surface hover:bg-surface-container",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SettingsNavItem({
  section,
  isActive,
  onSelect,
}: {
  section: DashboardSettingsSection;
  isActive: boolean;
  onSelect: (id: DashboardSettingsSectionId) => void;
}) {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const iconRef = useRef<AnimatedIconHandle>(null);
  const Icon = settingsIcons[section.icon];

  const startAnimation = () => iconRef.current?.startAnimation();
  const stopAnimation = () => iconRef.current?.stopAnimation();

  return (
    <button
      type="button"
      id={`settings-tab-${section.id}`}
      role="tab"
      aria-selected={isActive}
      aria-controls="settings-panel"
      onClick={() => onSelect(section.id)}
      onFocus={startAnimation}
      onBlur={stopAnimation}
      onMouseEnter={startAnimation}
      onMouseLeave={stopAnimation}
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
        aria-hidden="true"
        animateOnHover={false}
        className="relative z-10 shrink-0"
        size={19}
      />
      <span className="relative z-10 min-w-0">
        {t(section.labelKey, {
          defaultValue: section.fallbackLabels[language],
        })}
      </span>
    </button>
  );
}

function ConfiguracionGeneralPanel() {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const fallbackCopy = dashboardSettingsFallbackCopy[language];
  const [selectedCurrency, setSelectedCurrency] = useState("MXN");
  const [selectedTheme, setSelectedTheme] = useState<DashboardTheme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    try {
      return resolveDashboardTheme(
        window.localStorage.getItem(dashboardThemeStorageKey),
      );
    } catch {
      return "light";
    }
  });
  const sunIconRef = useRef<SunMediumIconHandle>(null);
  const moonIconRef = useRef<MoonIconHandle>(null);

  const changeLanguage = (languageValue: string) => {
    if (isSupportedLanguage(languageValue)) {
      i18n.changeLanguage(languageValue);
    }
  };

  const playThemeIconAnimation = (theme: DashboardTheme) => {
    const iconRef = theme === "light" ? sunIconRef : moonIconRef;

    iconRef.current?.startAnimation();
    window.setTimeout(() => iconRef.current?.stopAnimation(), 650);
  };

  const selectTheme = (theme: DashboardTheme) => {
    setSelectedTheme(theme);
    applyDashboardTheme(theme);
    playThemeIconAnimation(theme);
  };

  const languageOptions = [
    { value: "es", label: t("language.spanish") },
    { value: "en", label: t("language.english") },
  ];
  const currencyOptions = dashboardCurrencyOptions.map((option) => ({
    value: option.value,
    label: t(option.labelKey, {
      defaultValue: option.fallbackLabels[language],
    }),
  }));

  return (
    <div className="w-full max-w-[760px] text-left">
      <h2 className="font-heading text-2xl font-semibold leading-8 tracking-normal text-on-surface">
        {t("dashboard.settings.general.title", {
          defaultValue: fallbackCopy.generalTitle,
        })}
      </h2>

      <div className="mt-7 grid gap-6 md:grid-cols-2">
        <div className="block min-w-0">
          <label
            htmlFor="settings-interface-language"
            className="mb-2 block text-sm font-medium leading-5 text-on-surface-variant"
          >
            {t("dashboard.settings.general.interfaceLanguage.label", {
              defaultValue: fallbackCopy.interfaceLanguageLabel,
            })}
          </label>
          <SettingsSelect
            id="settings-interface-language"
            ariaLabel={t(
              "dashboard.settings.general.interfaceLanguage.label",
              {
                defaultValue: fallbackCopy.interfaceLanguageLabel,
              },
            )}
            value={language}
            onChange={changeLanguage}
            options={languageOptions}
          />
        </div>

        <div className="block min-w-0">
          <label
            htmlFor="settings-primary-currency"
            className="mb-2 block text-sm font-medium leading-5 text-on-surface-variant"
          >
            {t("dashboard.settings.general.currency.label", {
              defaultValue: fallbackCopy.currencyLabel,
            })}
          </label>
          <SettingsSelect
            id="settings-primary-currency"
            ariaLabel={t("dashboard.settings.general.currency.label", {
              defaultValue: fallbackCopy.currencyLabel,
            })}
            value={selectedCurrency}
            onChange={setSelectedCurrency}
            options={currencyOptions}
          />
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-2 text-sm font-medium leading-5 text-on-surface-variant">
          {t("dashboard.settings.general.theme.label", {
            defaultValue: fallbackCopy.visualThemeLabel,
          })}
        </p>
        <div
          role="group"
          aria-label={t("dashboard.settings.general.theme.label", {
            defaultValue: fallbackCopy.visualThemeLabel,
          })}
          className="relative inline-grid min-h-11 grid-cols-2 items-center gap-1.5 rounded-lg bg-accent p-1 text-sm font-semibold text-on-surface-variant"
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute bottom-1 left-1 top-1 w-[calc((100%_-_0.875rem)_/_2)] rounded-md bg-primary shadow-[0_1px_2px_rgb(0_0_0/0.08)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              selectedTheme === "dark"
                ? "translate-x-[calc(100%_+_0.375rem)]"
                : "translate-x-0",
            )}
          />
          <button
            type="button"
            aria-pressed={selectedTheme === "light"}
            onClick={() => selectTheme("light")}
            className={cn(
              "relative z-10 inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-md px-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              selectedTheme === "light"
                ? "text-primary-foreground"
                : "text-on-surface-variant hover:bg-surface-container-lowest/45",
            )}
          >
            <SunMediumIcon
              ref={sunIconRef}
              aria-hidden="true"
              size={16}
            />
            <span>
              {t("dashboard.settings.general.theme.light", {
                defaultValue: fallbackCopy.lightTheme,
              })}
            </span>
          </button>
          <button
            type="button"
            aria-pressed={selectedTheme === "dark"}
            onClick={() => selectTheme("dark")}
            className={cn(
              "relative z-10 inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-md px-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              selectedTheme === "dark"
                ? "text-primary-foreground"
                : "text-on-surface-variant hover:bg-surface-container-lowest/45",
            )}
          >
            <MoonIcon
              ref={moonIconRef}
              aria-hidden="true"
              size={16}
            />
            <span>
              {t("dashboard.settings.general.theme.dark", {
                defaultValue: fallbackCopy.darkTheme,
              })}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfiguracionSettingsView() {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const fallbackCopy = dashboardSettingsFallbackCopy[language];
  const [activeSectionId, setActiveSectionId] =
    useState<DashboardSettingsSectionId>("general");
  const shouldReduceMotion = useReducedMotion();
  const activeSection =
    dashboardSettingsSections.find((section) => section.id === activeSectionId) ??
    dashboardSettingsSections[0];
  const contentMotion = {
    initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 },
    transition: shouldReduceMotion
      ? { duration: 0 }
      : { duration: 0.18, ease: "easeOut" as const },
  };
  const activeSectionLabel = t(activeSection.labelKey, {
    defaultValue: activeSection.fallbackLabels[language],
  });

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-border bg-card px-4 py-5 text-card-foreground shadow-[0_4px_6px_-1px_rgb(0_0_0/0.05),0_2px_4px_-2px_rgb(0_0_0/0.05)] sm:px-5">
        <h1 className="px-1 font-heading text-2xl font-semibold leading-8 tracking-normal text-card-foreground">
          {t("dashboard.settings.title", { defaultValue: fallbackCopy.title })}
        </h1>
        <p className="mb-6 mt-2 px-1 text-sm leading-5 text-on-surface-variant">
          {t("dashboard.settings.description", {
            defaultValue: fallbackCopy.description,
          })}
        </p>

        <nav
          aria-label={t("dashboard.settings.navigationLabel", {
            defaultValue: fallbackCopy.navigationLabel,
          })}
        >
          <div role="tablist" aria-orientation="vertical" className="space-y-1">
            {dashboardSettingsSections.map((section) => (
              <SettingsNavItem
                key={section.id}
                section={section}
                isActive={section.id === activeSection.id}
                onSelect={setActiveSectionId}
              />
            ))}
          </div>
        </nav>
      </aside>

      <section
        id="settings-panel"
        role="tabpanel"
        aria-labelledby={`settings-tab-${activeSection.id}`}
        aria-live="polite"
        className="flex min-h-[320px] min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card px-5 py-10 text-center shadow-[0_4px_6px_-1px_rgb(0_0_0/0.05),0_2px_4px_-2px_rgb(0_0_0/0.05)] sm:min-h-[420px] sm:px-8"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection.id}
            className="w-full"
            initial={contentMotion.initial}
            animate={contentMotion.animate}
            exit={contentMotion.exit}
            transition={contentMotion.transition}
          >
            {activeSection.id === "general" ? (
              <ConfiguracionGeneralPanel />
            ) : (
              <h2 className="font-heading text-2xl font-semibold leading-8 tracking-normal text-on-surface sm:text-3xl sm:leading-10">
                {t("dashboard.settings.greeting", {
                  defaultValue: fallbackCopy.greeting,
                  section: activeSectionLabel,
                })}
              </h2>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </section>
  );
}
