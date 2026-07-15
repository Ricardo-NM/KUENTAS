"use client";

import {
  BadgeAlertIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  CircleCheckIcon,
  DeleteIcon,
  KeySquareIcon,
  LogoutIcon,
  MailboxIcon,
  MoonIcon,
  SunMediumIcon,
  SwitchCameraIcon,
  UploadIcon,
  XIcon,
  type MoonIconHandle,
  type SunMediumIconHandle,
  BellIcon,
  CogIcon,
  ShieldCheckIcon,
  UserRoundCogIcon,
} from "lucide-animated";
import {
  Laptop,
  MonitorSmartphone,
  Smartphone,
  UserRoundX,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type ForwardRefExoticComponent,
  type MouseEvent,
  type RefAttributes,
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  revokeOtherSessionsAction,
  revokeSessionAction,
  updateUserProfileAction,
  type DashboardProfileActionState,
} from "./actions";
import {
  dashboardCurrencyOptions,
  dashboardNotificationOptions,
  dashboardSettingsFallbackCopy,
  dashboardSettingsSections,
  type DashboardNotificationIcon,
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
  readDashboardThemePreference,
  startDashboardThemeViewTransition,
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

const notificationIcons: Record<DashboardNotificationIcon, AnimatedIcon> = {
  "calendar-days": CalendarDaysIcon,
  "badge-alert": BadgeAlertIcon,
  mailbox: MailboxIcon,
};

type DashboardSettingsProfile = {
  firstName: string;
  lastName: string;
  email: string;
};

type DashboardSessionActivity = {
  id: string;
  deviceLabel: string;
  lastSeenAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

type SessionConfirmation =
  | {
      type: "single";
      sessionId: string;
      deviceLabel: string;
    }
  | {
      type: "all";
    };

const initialProfileActionState: DashboardProfileActionState = {
  status: "idle",
};

function isMobileSessionDevice(deviceLabel: string) {
  const normalizedLabel = deviceLabel.toLowerCase();

  return normalizedLabel.includes("iphone") ||
    normalizedLabel.includes("ipad") ||
    normalizedLabel.includes("android");
}

function getSessionActivityIcon(deviceLabel: string): LucideIcon {
  return isMobileSessionDevice(deviceLabel)
    ? Smartphone
    : Laptop;
}

function formatSessionActivityTime(
  lastSeenAt: string,
  language: "es" | "en",
) {
  const diffMs = new Date(lastSeenAt).getTime() - Date.now();
  const absoluteDiffMs = Math.abs(diffMs);
  const formatter = new Intl.RelativeTimeFormat(language, {
    numeric: "auto",
  });

  if (absoluteDiffMs < 60 * 1000) {
    return formatter.format(0, "minute");
  }

  if (absoluteDiffMs < 60 * 60 * 1000) {
    return formatter.format(Math.round(diffMs / (60 * 1000)), "minute");
  }

  if (absoluteDiffMs < 24 * 60 * 60 * 1000) {
    return formatter.format(Math.round(diffMs / (60 * 60 * 1000)), "hour");
  }

  return formatter.format(Math.round(diffMs / (24 * 60 * 60 * 1000)), "day");
}

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

function SettingsToggleRow({
  ariaLabel,
  description,
  Icon,
  id,
  initiallyEnabled,
  title,
}: {
  ariaLabel: string;
  description: string;
  Icon: AnimatedIcon;
  id: string;
  initiallyEnabled: boolean;
  title: string;
}) {
  const [isEnabled, setIsEnabled] = useState(initiallyEnabled);
  const iconRef = useRef<AnimatedIconHandle>(null);
  const shouldReduceMotion = useReducedMotion();

  const toggle = () => {
    setIsEnabled((current) => !current);

    if (shouldReduceMotion) {
      return;
    }

    iconRef.current?.startAnimation();
    window.setTimeout(() => iconRef.current?.stopAnimation(), 650);
  };

  return (
    <div className="flex min-w-0 items-center justify-between gap-4 py-4 text-left">
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
            isEnabled
              ? "bg-primary/10 text-primary"
              : "bg-surface-container text-on-surface-variant",
          )}
        >
          <Icon
            ref={iconRef}
            animateOnHover={false}
            className="shrink-0"
            size={19}
          />
        </span>
        <div className="min-w-0">
          <h3
            id={`${id}-title`}
            className="text-sm font-semibold leading-5 text-on-surface"
          >
            {title}
          </h3>
          <p
            id={`${id}-description`}
            className="mt-0.5 text-xs leading-[18px] text-on-surface-variant"
          >
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isEnabled}
        aria-label={ariaLabel}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onClick={toggle}
        className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span
          aria-hidden="true"
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors duration-200 ease-out",
            isEnabled ? "bg-primary" : "bg-surface-container-highest",
          )}
        >
          <span
            className={cn(
              "absolute left-0.5 top-0.5 size-5 rounded-full shadow-[0_1px_3px_rgb(13_13_18/0.2)] transition-transform duration-200 ease-out",
              isEnabled
                ? "translate-x-5 bg-primary-foreground"
                : "translate-x-0 bg-surface-container-lowest",
            )}
          />
        </span>
      </button>
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
  const [selectedTheme, setSelectedTheme] = useState<DashboardTheme>("light");
  const sunIconRef = useRef<SunMediumIconHandle>(null);
  const moonIconRef = useRef<MoonIconHandle>(null);

  useEffect(() => {
    const syncTheme = window.setTimeout(() => {
      setSelectedTheme(readDashboardThemePreference());
    }, 0);

    return () => window.clearTimeout(syncTheme);
  }, []);

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

  const selectTheme = (
    theme: DashboardTheme,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const origin = {
      clientX: event.clientX || bounds.left + bounds.width / 2,
      clientY: event.clientY || bounds.top + bounds.height / 2,
    };

    startDashboardThemeViewTransition({
      origin,
      update: () => {
        setSelectedTheme(theme);
        applyDashboardTheme(theme);
      },
    });
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
            onClick={(event) => selectTheme("light", event)}
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
            onClick={(event) => selectTheme("dark", event)}
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

function ConfiguracionProfilePanel({ user }: { user: DashboardSettingsProfile }) {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const fallbackCopy = dashboardSettingsFallbackCopy[language];
  const [state, formAction, isPending] = useActionState(
    updateUserProfileAction,
    initialProfileActionState,
  );
  const avatarIconRef = useRef<AnimatedIconHandle>(null);
  const uploadIconRef = useRef<AnimatedIconHandle>(null);
  const deleteIconRef = useRef<AnimatedIconHandle>(null);
  const cancelIconRef = useRef<AnimatedIconHandle>(null);
  const saveIconRef = useRef<AnimatedIconHandle>(null);
  const shouldReduceMotion = useReducedMotion();
  const [hiddenSavedMessageId, setHiddenSavedMessageId] = useState<
    string | null
  >(null);
  const [firstNameValue, setFirstNameValue] = useState(user.firstName);
  const [lastNameValue, setLastNameValue] = useState(user.lastName);
  const firstNameError = state.errors?.firstName?.[0];
  const lastNameError = state.errors?.lastName?.[0];
  const savedFirstName =
    state.status === "success" ? state.values.firstName : user.firstName;
  const savedLastName =
    state.status === "success" ? state.values.lastName : user.lastName;
  const hasProfileChanges =
    firstNameValue.trim() !== savedFirstName ||
    lastNameValue.trim() !== savedLastName;
  const savedMessage =
    state.status === "success" && state.messageKey
      ? t(state.messageKey, {
          defaultValue: fallbackCopy.profileSaved,
        })
      : undefined;
  const savedMessageId = state.status === "success" ? state.successId : null;
  const showSavedMessage =
    Boolean(savedMessage && savedMessageId) &&
    savedMessageId !== hiddenSavedMessageId;
  const fieldClassName =
    "min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm font-medium text-on-surface shadow-[0_1px_2px_rgb(13_13_18/0.04)] outline-none transition placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/15";

  useEffect(() => {
    if (!savedMessageId) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setHiddenSavedMessageId(savedMessageId);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [savedMessageId]);

  return (
    <form action={formAction} className="w-full max-w-[760px] text-left">
      <h2 className="font-heading text-2xl font-semibold leading-8 tracking-normal text-on-surface">
        {t("dashboard.settings.profile.title", {
          defaultValue: fallbackCopy.profileTitle,
        })}
      </h2>

      <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center">
        <button
          type="button"
          aria-label={t("dashboard.settings.profile.photo.avatarLabel", {
            defaultValue: fallbackCopy.profileAvatarLabel,
          })}
          onFocus={() => avatarIconRef.current?.startAnimation()}
          onBlur={() => avatarIconRef.current?.stopAnimation()}
          onMouseEnter={() => avatarIconRef.current?.startAnimation()}
          onMouseLeave={() => avatarIconRef.current?.stopAnimation()}
          className="group relative inline-flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container-highest text-xl font-bold text-on-surface shadow-[inset_0_0_0_1px_rgb(255_255_255/0.16)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span aria-hidden="true">
            {(user.firstName || user.email).trim().charAt(0).toUpperCase()}
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-primary/72 text-primary-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <SwitchCameraIcon
              ref={avatarIconRef}
              animateOnHover={false}
              size={28}
            />
          </span>
        </button>

        <div className="min-w-0">
          <p className="text-base font-bold leading-6 text-on-surface">
            {t("dashboard.settings.profile.photo.title", {
              defaultValue: fallbackCopy.profilePhotoTitle,
            })}
          </p>
          <p className="mt-1 text-sm leading-5 text-on-surface-variant">
            {t("dashboard.settings.profile.photo.help", {
              defaultValue: fallbackCopy.profilePhotoHelp,
            })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onFocus={() => uploadIconRef.current?.startAnimation()}
              onBlur={() => uploadIconRef.current?.stopAnimation()}
              onMouseEnter={() => uploadIconRef.current?.startAnimation()}
              onMouseLeave={() => uploadIconRef.current?.stopAnimation()}
              className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[0_4px_10px_rgb(13_13_18/0.12)]"
            >
              <UploadIcon
                ref={uploadIconRef}
                aria-hidden="true"
                animateOnHover={false}
                size={16}
              />
              {t("dashboard.settings.profile.photo.upload", {
                defaultValue: fallbackCopy.profileUpload,
              })}
            </button>
            <button
              type="button"
              onFocus={() => deleteIconRef.current?.startAnimation()}
              onBlur={() => deleteIconRef.current?.stopAnimation()}
              onMouseEnter={() => deleteIconRef.current?.startAnimation()}
              onMouseLeave={() => deleteIconRef.current?.stopAnimation()}
              className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-accent-foreground"
            >
              <DeleteIcon
                ref={deleteIconRef}
                aria-hidden="true"
                animateOnHover={false}
                size={16}
              />
              {t("dashboard.settings.profile.photo.delete", {
                defaultValue: fallbackCopy.profileDelete,
              })}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="min-w-0">
          <label
            htmlFor="profile-first-name"
            className="mb-2 block text-sm font-medium leading-5 text-on-surface-variant"
          >
            {t("dashboard.settings.profile.fields.firstName", {
              defaultValue: fallbackCopy.profileFirstName,
            })}
          </label>
          <input
            id="profile-first-name"
            name="firstName"
            type="text"
            autoComplete="given-name"
            value={firstNameValue}
            onChange={(event) => setFirstNameValue(event.target.value)}
            aria-invalid={Boolean(firstNameError)}
            aria-describedby={
              firstNameError ? "profile-first-name-error" : undefined
            }
            className={cn(
              fieldClassName,
              firstNameError ? "border-destructive focus:border-destructive" : "",
            )}
          />
          {firstNameError ? (
            <p
              id="profile-first-name-error"
              className="mt-2 text-xs font-semibold text-destructive"
            >
              {firstNameError}
            </p>
          ) : null}
        </div>

        <div className="min-w-0">
          <label
            htmlFor="profile-last-name"
            className="mb-2 block text-sm font-medium leading-5 text-on-surface-variant"
          >
            {t("dashboard.settings.profile.fields.lastName", {
              defaultValue: fallbackCopy.profileLastName,
            })}
          </label>
          <input
            id="profile-last-name"
            name="lastName"
            type="text"
            autoComplete="family-name"
            value={lastNameValue}
            onChange={(event) => setLastNameValue(event.target.value)}
            aria-invalid={Boolean(lastNameError)}
            aria-describedby={
              lastNameError ? "profile-last-name-error" : undefined
            }
            className={cn(
              fieldClassName,
              lastNameError ? "border-destructive focus:border-destructive" : "",
            )}
          />
          {lastNameError ? (
            <p
              id="profile-last-name-error"
              className="mt-2 text-xs font-semibold text-destructive"
            >
              {lastNameError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(260px,360px)_1fr] lg:items-end">
        <div className="min-w-0">
          <label
            htmlFor="profile-email"
            className="mb-2 block text-sm font-medium leading-5 text-on-surface-variant"
          >
            {t("dashboard.settings.profile.fields.email", {
              defaultValue: fallbackCopy.profileEmail,
            })}
          </label>
          <input
            id="profile-email"
            type="email"
            autoComplete="email"
            value={user.email}
            readOnly
            aria-readonly="true"
            className="min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container px-4 text-sm font-medium text-on-surface-variant outline-none"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row lg:justify-end">
          <button
            type="reset"
            onClick={() => {
              setFirstNameValue(savedFirstName);
              setLastNameValue(savedLastName);
            }}
            onFocus={() => cancelIconRef.current?.startAnimation()}
            onBlur={() => cancelIconRef.current?.stopAnimation()}
            onMouseEnter={() => cancelIconRef.current?.startAnimation()}
            onMouseLeave={() => cancelIconRef.current?.stopAnimation()}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-outline bg-surface-container-lowest px-5 text-sm font-semibold text-on-surface transition hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <XIcon
              ref={cancelIconRef}
              aria-hidden="true"
              animateOnHover={false}
              className="mr-2"
              size={17}
            />
            {t("dashboard.settings.profile.actions.cancel", {
              defaultValue: fallbackCopy.profileCancel,
            })}
          </button>
          <button
            type="submit"
            disabled={isPending || !hasProfileChanges}
            onFocus={() => saveIconRef.current?.startAnimation()}
            onBlur={() => saveIconRef.current?.stopAnimation()}
            onMouseEnter={() => saveIconRef.current?.startAnimation()}
            onMouseLeave={() => saveIconRef.current?.stopAnimation()}
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition-[background-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              hasProfileChanges && !isPending
                ? "cursor-pointer bg-primary text-primary-foreground shadow-[0_8px_20px_rgb(13_13_18/0.16)] hover:bg-primary/90"
                : "cursor-not-allowed bg-surface-container-high text-on-surface-variant shadow-none",
            )}
          >
            <CircleCheckIcon
              ref={saveIconRef}
              aria-hidden="true"
              animateOnHover={false}
              size={18}
            />
            {isPending
              ? t("dashboard.settings.profile.actions.saving", {
                  defaultValue: fallbackCopy.profileSaving,
                })
              : t("dashboard.settings.profile.actions.save", {
                  defaultValue: fallbackCopy.profileSave,
                })}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {savedMessage && showSavedMessage ? (
          <motion.p
            key={savedMessageId}
            role="status"
            className="mt-4 text-right text-sm font-semibold text-chart-1"
            initial={
              shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              shouldReduceMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: -8 }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.22, ease: "easeOut" }
            }
          >
            {savedMessage}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </form>
  );
}

function ConfiguracionNotificationsPanel() {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const fallbackCopy = dashboardSettingsFallbackCopy[language];

  return (
    <div className="w-full max-w-[760px] text-left">
      <h2 className="font-heading text-2xl font-semibold leading-8 tracking-normal text-on-surface">
        {t("dashboard.settings.notifications.title", {
          defaultValue: fallbackCopy.notificationsTitle,
        })}
      </h2>

      <div className="mt-5 divide-y divide-border">
        {dashboardNotificationOptions.map((option) => {
          const title = t(option.titleKey, {
            defaultValue: option.fallbackTitles[language],
          });
          const description = t(option.descriptionKey, {
            defaultValue: option.fallbackDescriptions[language],
          });
          const Icon = notificationIcons[option.icon];

          return (
            <SettingsToggleRow
              key={option.id}
              id={`notification-${option.id}`}
              title={title}
              description={description}
              ariaLabel={title}
              Icon={Icon}
              initiallyEnabled={option.initiallyEnabled}
            />
          );
        })}
      </div>
    </div>
  );
}

function ConfiguracionSecurityPanel({
  sessions,
}: {
  sessions: DashboardSessionActivity[];
}) {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const fallbackCopy = dashboardSettingsFallbackCopy[language];
  const cancelDeleteAccountIconRef = useRef<AnimatedIconHandle>(null);
  const confirmDeleteAccountIconRef = useRef<AnimatedIconHandle>(null);
  const cancelSessionIconRef = useRef<AnimatedIconHandle>(null);
  const deleteAccountIconRef = useRef<AnimatedIconHandle>(null);
  const logoutSessionIconRef = useRef<AnimatedIconHandle>(null);
  const [isDeleteAccountConfirmationOpen, setIsDeleteAccountConfirmationOpen] =
    useState(false);
  const [confirmation, setConfirmation] = useState<SessionConfirmation | null>(
    null,
  );
  const [sessionFeedbackKey, setSessionFeedbackKey] = useState<string | null>(
    null,
  );
  const [isSessionActionPending, startSessionActionTransition] =
    useTransition();
  const fieldClassName =
    "min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm font-medium text-on-surface shadow-[0_1px_2px_rgb(13_13_18/0.04)] outline-none transition placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/15";
  const destructiveActionClassName =
    "inline-flex min-h-9 cursor-pointer items-center justify-center rounded-lg border border-destructive bg-[#ffffff] px-4 text-xs font-bold leading-4 text-destructive shadow-[0_1px_2px_rgb(13_13_18/0.04)] transition-colors duration-200 hover:bg-destructive hover:text-[#ffffff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  const signOutTextActionClassName =
    "inline-flex cursor-pointer border-0 bg-transparent p-0 text-xs font-bold leading-4 text-destructive shadow-none transition-opacity duration-200 hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  const passwordPlaceholder = t("common.passwordPlaceholder", {
    defaultValue: "••••••••",
  });
  const passwordFields = [
    {
      id: "security-current-password",
      labelKey: "dashboard.settings.security.password.fields.current",
      fallback: fallbackCopy.securityCurrentPassword,
      autoComplete: "current-password",
    },
    {
      id: "security-new-password",
      labelKey: "dashboard.settings.security.password.fields.new",
      fallback: fallbackCopy.securityNewPassword,
      autoComplete: "new-password",
    },
    {
      id: "security-confirm-password",
      labelKey: "dashboard.settings.security.password.fields.confirm",
      fallback: fallbackCopy.securityConfirmPassword,
      autoComplete: "new-password",
    },
  ];
  const hasOtherSessions = sessions.some((session) => !session.isCurrent);
  const confirmationSession =
    confirmation?.type === "single"
      ? sessions.find((session) => session.id === confirmation.sessionId)
      : null;
  const isConfirmationMobileDevice =
    confirmation?.type === "single" &&
    isMobileSessionDevice(confirmation.deviceLabel);
  const confirmationSessionTime =
    confirmation?.type === "single"
      ? confirmationSession?.isCurrent
        ? t("dashboard.settings.security.recentActivity.activeNow", {
            defaultValue: fallbackCopy.securityActiveNow,
          })
        : confirmationSession?.lastSeenAt
          ? formatSessionActivityTime(confirmationSession.lastSeenAt, language)
          : null
      : null;
  const confirmationTitle =
    confirmation?.type === "all"
      ? t("dashboard.settings.security.recentActivity.confirm.closeAllTitle", {
          defaultValue: fallbackCopy.securityConfirmCloseAllTitle,
        })
      : t("dashboard.settings.security.recentActivity.confirm.closeTitle", {
          defaultValue: fallbackCopy.securityConfirmCloseTitle,
        });
  const confirmationDescription =
    confirmation?.type === "all"
      ? t("dashboard.settings.security.recentActivity.confirm.closeAllBody", {
          defaultValue: fallbackCopy.securityConfirmCloseAllBody,
        })
      : t("dashboard.settings.security.recentActivity.confirm.closeBody", {
          defaultValue: fallbackCopy.securityConfirmCloseBody,
          device: confirmation?.deviceLabel ?? "",
        });
  const executeConfirmedSessionAction = () => {
    if (!confirmation) {
      return;
    }

    startSessionActionTransition(() => {
      void (async () => {
        const result =
          confirmation.type === "all"
            ? await revokeOtherSessionsAction()
            : await revokeSessionAction(confirmation.sessionId);

        setSessionFeedbackKey(result.messageKey);
        setConfirmation(null);

        if (result.status === "success") {
          router.refresh();
        }
      })();
    });
  };

  return (
    <div className="w-full max-w-[760px] text-left">
      <h2 className="font-heading text-2xl font-semibold leading-8 tracking-normal text-on-surface">
        {t("dashboard.settings.security.title", {
          defaultValue: fallbackCopy.securityTitle,
        })}
      </h2>

      <div className="mt-7 space-y-9">
        <section
          aria-labelledby="security-2fa-title"
          className="rounded-xl border border-outline-variant bg-accent/55 p-4 text-on-surface sm:p-5"
        >
          <SettingsToggleRow
            id="security-2fa"
            title={t("dashboard.settings.security.twoFactor.title", {
              defaultValue: fallbackCopy.securityTwoFactorTitle,
            })}
            description={t(
              "dashboard.settings.security.twoFactor.description",
              {
                defaultValue: fallbackCopy.securityTwoFactorDescription,
              },
            )}
            ariaLabel={t(
              "dashboard.settings.security.twoFactor.enabledLabel",
              {
                defaultValue: fallbackCopy.securityTwoFactorEnabled,
              },
            )}
            Icon={KeySquareIcon}
            initiallyEnabled={true}
          />
        </section>

        <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(250px,300px)] lg:items-start">
          <div className="space-y-9">
            <section aria-labelledby="security-password-title">
              <h3
                id="security-password-title"
                className="text-base font-bold leading-6 text-on-surface"
              >
                {t("dashboard.settings.security.password.title", {
                  defaultValue: fallbackCopy.securityPasswordTitle,
                })}
              </h3>
              <div className="mt-4 grid gap-4">
                {passwordFields.map((field) => (
                  <div key={field.id} className="min-w-0">
                    <label
                      htmlFor={field.id}
                      className="mb-2 block text-sm font-medium leading-5 text-on-surface-variant"
                    >
                      {t(field.labelKey, { defaultValue: field.fallback })}
                    </label>
                    <input
                      id={field.id}
                      type="password"
                      autoComplete={field.autoComplete}
                      readOnly
                      placeholder={passwordPlaceholder}
                      className={fieldClassName}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section
              aria-labelledby="security-danger-title"
              className="rounded-xl border border-destructive/25 bg-destructive-container/35 p-5 text-on-surface"
            >
              <h3
                id="security-danger-title"
                className="text-base font-bold leading-6 text-destructive"
              >
                {t("dashboard.settings.security.dangerZone.title", {
                  defaultValue: fallbackCopy.securityDangerTitle,
                })}
              </h3>
              <p className="mt-3 max-w-[620px] text-sm leading-5 text-on-surface-variant">
                {t("dashboard.settings.security.dangerZone.description", {
                  defaultValue: fallbackCopy.securityDangerDescription,
                })}
              </p>
              <button
                type="button"
                onFocus={() => deleteAccountIconRef.current?.startAnimation()}
                onBlur={() => deleteAccountIconRef.current?.stopAnimation()}
                onMouseEnter={() =>
                  deleteAccountIconRef.current?.startAnimation()
                }
                onMouseLeave={() =>
                  deleteAccountIconRef.current?.stopAnimation()
                }
                onClick={() => setIsDeleteAccountConfirmationOpen(true)}
                className={cn(
                  destructiveActionClassName,
                  "mt-5 min-h-11 gap-2 px-5 text-sm",
                )}
              >
                <DeleteIcon
                  ref={deleteAccountIconRef}
                  aria-hidden="true"
                  animateOnHover={false}
                  size={17}
                />
                {t("dashboard.settings.security.dangerZone.action", {
                  defaultValue: fallbackCopy.securityDangerAction,
                })}
              </button>
            </section>
          </div>

          <section
            aria-labelledby="security-activity-title"
            className="lg:border-l lg:border-border lg:pl-8"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-start">
              <h3
                id="security-activity-title"
                className="text-base font-bold leading-6 text-on-surface"
              >
                {t("dashboard.settings.security.recentActivity.title", {
                  defaultValue: fallbackCopy.securityRecentActivityTitle,
                })}
              </h3>
              <button
                type="button"
                disabled={!hasOtherSessions || isSessionActionPending}
                onClick={() => setConfirmation({ type: "all" })}
                className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-xs font-bold text-on-surface transition hover:border-outline hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-45"
              >
                {t("dashboard.settings.security.recentActivity.closeAll", {
                  defaultValue: fallbackCopy.securityCloseAllSessions,
                })}
              </button>
            </div>

            <div className="mt-4 divide-y divide-border">
              {sessions.length > 0 ? (
                sessions.map((session) => {
                  const deviceLabel =
                    session.deviceLabel === "Dispositivo desconocido"
                      ? t(
                          "dashboard.settings.security.recentActivity.unknownDevice",
                          {
                            defaultValue: fallbackCopy.securityUnknownDevice,
                          },
                        )
                      : session.deviceLabel;
                  const ActivityIcon = getSessionActivityIcon(
                    deviceLabel,
                  );

                  return (
                  <div
                    key={session.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <ActivityIcon
                        aria-hidden="true"
                        size={20}
                        className="mt-0.5 shrink-0 text-on-surface-variant"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-5 text-on-surface">
                          {deviceLabel}
                        </p>
                        <p className="text-xs font-medium leading-4 text-on-surface-variant">
                          {session.isCurrent
                            ? t(
                                "dashboard.settings.security.recentActivity.activeNow",
                                {
                                  defaultValue:
                                    fallbackCopy.securityActiveNow,
                                },
                              )
                            : formatSessionActivityTime(
                                session.lastSeenAt,
                                language,
                              )}
                        </p>
                      </div>
                    </div>
                    {session.isCurrent ? (
                      <span className="text-xs font-bold leading-4 text-chart-1">
                        {t(
                          "dashboard.settings.security.recentActivity.current",
                          {
                            defaultValue: fallbackCopy.securityCurrentSession,
                          },
                        )}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isSessionActionPending}
                        onClick={() =>
                          setConfirmation({
                            type: "single",
                            sessionId: session.id,
                            deviceLabel,
                          })
                        }
                        className={cn(
                          signOutTextActionClassName,
                          "self-start disabled:cursor-not-allowed disabled:opacity-45",
                        )}
                      >
                        {t(
                          "dashboard.settings.security.recentActivity.closeSession",
                          {
                            defaultValue: fallbackCopy.securitySignOut,
                          },
                        )}
                      </button>
                    )}
                  </div>
                  );
                })
              ) : (
                <p className="py-4 text-sm leading-5 text-on-surface-variant">
                  {t("dashboard.settings.security.recentActivity.empty", {
                    defaultValue: fallbackCopy.securityNoSessions,
                  })}
                </p>
              )}
            </div>

            {sessionFeedbackKey ? (
              <p
                role="status"
                className="mt-4 text-xs font-semibold text-on-surface-variant"
              >
                {t(sessionFeedbackKey, {
                  defaultValue: fallbackCopy.securitySessionActionFeedback,
                })}
              </p>
            ) : null}
          </section>
        </div>
      </div>

      <AnimatePresence>
        {confirmation ? (
          <motion.div
            role="presentation"
            className="fixed inset-0 z-50 grid place-items-center bg-inverse-surface/45 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="session-confirmation-title"
              aria-describedby="session-confirmation-description"
              className="w-full max-w-[430px] rounded-2xl border border-border bg-popover p-5 text-popover-foreground shadow-[0_18px_40px_rgb(13_13_18/0.18)]"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="flex min-w-0 items-center gap-3 text-left">
                <span
                  aria-hidden="true"
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive-container/75 text-destructive"
                >
                  {confirmation?.type === "all" ? (
                    <MonitorSmartphone
                      aria-hidden="true"
                      className="shrink-0"
                      size={20}
                    />
                  ) : isConfirmationMobileDevice ? (
                    <Smartphone
                      aria-hidden="true"
                      className="shrink-0"
                      size={20}
                    />
                  ) : (
                    <Laptop
                      aria-hidden="true"
                      className="shrink-0"
                      size={20}
                    />
                  )}
                </span>
                <div className="min-w-0">
                  <h3
                    id="session-confirmation-title"
                    className="break-words text-sm font-bold leading-5 text-on-surface"
                  >
                    {confirmation?.type === "single"
                      ? confirmation.deviceLabel
                      : confirmationTitle}
                  </h3>
                  {confirmationSessionTime ? (
                    <p className="text-xs font-medium leading-4 text-on-surface-variant">
                      {confirmationSessionTime}
                    </p>
                  ) : null}
                </div>
              </div>
              <p
                id="session-confirmation-description"
                className="mt-4 text-sm leading-5 text-on-surface-variant"
              >
                {confirmationDescription}
              </p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isSessionActionPending}
                  onClick={() => setConfirmation(null)}
                  onFocus={() => cancelSessionIconRef.current?.startAnimation()}
                  onBlur={() => cancelSessionIconRef.current?.stopAnimation()}
                  onMouseEnter={() =>
                    cancelSessionIconRef.current?.startAnimation()
                  }
                  onMouseLeave={() =>
                    cancelSessionIconRef.current?.stopAnimation()
                  }
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline bg-surface-container-lowest px-5 text-sm font-semibold text-on-surface transition hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <XIcon
                    ref={cancelSessionIconRef}
                    aria-hidden="true"
                    animateOnHover={false}
                    size={16}
                  />
                  {t("dashboard.settings.security.recentActivity.confirm.cancel", {
                    defaultValue: fallbackCopy.securityConfirmCancel,
                  })}
                </button>
                <button
                  type="button"
                  disabled={isSessionActionPending}
                  onClick={executeConfirmedSessionAction}
                  onFocus={() => logoutSessionIconRef.current?.startAnimation()}
                  onBlur={() => logoutSessionIconRef.current?.stopAnimation()}
                  onMouseEnter={() =>
                    logoutSessionIconRef.current?.startAnimation()
                  }
                  onMouseLeave={() =>
                    logoutSessionIconRef.current?.stopAnimation()
                  }
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-destructive px-5 text-sm font-bold text-destructive-foreground transition hover:bg-destructive/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogoutIcon
                    ref={logoutSessionIconRef}
                    aria-hidden="true"
                    animateOnHover={false}
                    size={16}
                  />
                  {isSessionActionPending
                    ? t(
                        "dashboard.settings.security.recentActivity.confirm.closing",
                        {
                          defaultValue: fallbackCopy.securityClosingSession,
                        },
                      )
                    : t(
                        "dashboard.settings.security.recentActivity.confirm.confirm",
                        {
                          defaultValue: fallbackCopy.securityConfirmAction,
                        },
                      )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteAccountConfirmationOpen ? (
          <motion.div
            role="presentation"
            className="fixed inset-0 z-50 grid place-items-center bg-inverse-surface/45 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-account-confirmation-title"
              aria-describedby="delete-account-confirmation-description"
              className="w-full max-w-[430px] rounded-2xl border border-border bg-popover p-5 text-popover-foreground shadow-[0_18px_40px_rgb(13_13_18/0.18)]"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="flex min-w-0 items-center gap-3 text-left">
                <span
                  aria-hidden="true"
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive-container/75 text-destructive"
                >
                  <UserRoundX
                    aria-hidden="true"
                    className="shrink-0"
                    size={20}
                  />
                </span>
                <h3
                  id="delete-account-confirmation-title"
                  className="break-words text-sm font-bold leading-5 text-on-surface"
                >
                  {t("dashboard.settings.security.dangerZone.confirm.title", {
                    defaultValue:
                      fallbackCopy.securityDeleteAccountConfirmTitle,
                  })}
                </h3>
              </div>
              <p
                id="delete-account-confirmation-description"
                className="mt-4 text-sm leading-5 text-on-surface-variant"
              >
                {t("dashboard.settings.security.dangerZone.confirm.body", {
                  defaultValue: fallbackCopy.securityDeleteAccountConfirmBody,
                })}
              </p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsDeleteAccountConfirmationOpen(false)}
                  onFocus={() =>
                    cancelDeleteAccountIconRef.current?.startAnimation()
                  }
                  onBlur={() =>
                    cancelDeleteAccountIconRef.current?.stopAnimation()
                  }
                  onMouseEnter={() =>
                    cancelDeleteAccountIconRef.current?.startAnimation()
                  }
                  onMouseLeave={() =>
                    cancelDeleteAccountIconRef.current?.stopAnimation()
                  }
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline bg-surface-container-lowest px-5 text-sm font-semibold text-on-surface transition hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <XIcon
                    ref={cancelDeleteAccountIconRef}
                    aria-hidden="true"
                    animateOnHover={false}
                    size={16}
                  />
                  {t("dashboard.settings.security.dangerZone.confirm.cancel", {
                    defaultValue:
                      fallbackCopy.securityDeleteAccountConfirmCancel,
                  })}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteAccountConfirmationOpen(false)}
                  onFocus={() =>
                    confirmDeleteAccountIconRef.current?.startAnimation()
                  }
                  onBlur={() =>
                    confirmDeleteAccountIconRef.current?.stopAnimation()
                  }
                  onMouseEnter={() =>
                    confirmDeleteAccountIconRef.current?.startAnimation()
                  }
                  onMouseLeave={() =>
                    confirmDeleteAccountIconRef.current?.stopAnimation()
                  }
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-destructive px-5 text-sm font-bold text-destructive-foreground transition hover:bg-destructive/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <DeleteIcon
                    ref={confirmDeleteAccountIconRef}
                    aria-hidden="true"
                    animateOnHover={false}
                    size={16}
                  />
                  {t("dashboard.settings.security.dangerZone.confirm.confirm", {
                    defaultValue:
                      fallbackCopy.securityDeleteAccountConfirmAction,
                  })}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function ConfiguracionSettingsView({
  sessions,
  user,
}: {
  sessions: DashboardSessionActivity[];
  user: DashboardSettingsProfile;
}) {
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
            ) : activeSection.id === "perfil" ? (
              <ConfiguracionProfilePanel user={user} />
            ) : activeSection.id === "notificaciones" ? (
              <ConfiguracionNotificationsPanel />
            ) : activeSection.id === "seguridad" ? (
              <ConfiguracionSecurityPanel sessions={sessions} />
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
