"use client";

import {
  BadgeAlertIcon,
  BlocksIcon,
  CalendarCheck2Icon,
  CalendarCogIcon,
  CalendarDaysIcon,
  CheckCheckIcon,
  ChevronDownIcon,
  CircleDollarSignIcon,
  CircleCheckIcon,
  DeleteIcon,
  KeyIcon,
  KeySquareIcon,
  LanguagesIcon,
  LockKeyholeIcon,
  LockKeyholeOpenIcon,
  LogoutIcon,
  MailCheckIcon,
  MailboxIcon,
  MoonIcon,
  SunMediumIcon,
  SwitchCameraIcon,
  UploadIcon,
  UserIcon,
  XIcon,
  type MoonIconHandle,
  type SunMediumIconHandle,
} from "lucide-animated";
import {
  Eye,
  EyeOff,
  Laptop,
  MonitorSmartphone,
  Smartphone,
  UserRoundX,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "react-hot-toast";
import {
  type ChangeEvent,
  type ComponentType,
  type ComponentPropsWithoutRef,
  type DragEvent,
  type FormEvent,
  type ForwardRefExoticComponent,
  type MouseEvent,
  type RefAttributes,
  type ReactNode,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import type { Area, CropperProps } from "react-easy-crop";
import {
  cancelAccountDeletionAction,
  cancelPasswordChangeAction,
  confirmAccountDeletionAction,
  confirmPasswordChangeAction,
  completePasswordChangeSessionAction,
  requestPasswordChangeCodeAction,
  requestAccountDeletionCodeAction,
  revokeOtherSessionsAction,
  revokeSessionAction,
  updateUserProfileAction,
  type DeleteAccountActionState,
  type DashboardProfileActionState,
  type PasswordChangeActionState,
  type PasswordChangeSessionMode,
} from "./actions";
import {
  dashboardCurrencyOptions,
  dashboardDateFormatOptions,
  dashboardNotificationOptions,
  dashboardSettingsFallbackCopy,
  dashboardSettingsSectionParamName,
  dashboardSettingsSections,
  dashboardWeekStartOptions,
  isDashboardSettingsSectionId,
  type DashboardNotificationIcon,
  type DashboardSettingsSectionId,
} from "@/lib/dashboard/settings";
import { isSupportedLanguage } from "@/lib/i18n/resources";
import {
  applyDashboardTheme,
  readDashboardThemePreference,
  startDashboardThemeViewTransition,
  type DashboardTheme,
} from "@/lib/dashboard/theme-preference";
import { cn } from "@/lib/utils";
import {
  getPasswordRequirements,
  shouldShowPasswordMismatch,
} from "@/lib/auth/password-requirements";
import { maskEmailForDisplay } from "@/lib/dashboard/user";
import { AnimatedFormMessage } from "../../(auth)/animated-form-message";
import { useTranslation } from "react-i18next";

type LazyCropperProps = Pick<CropperProps, "crop" | "onCropChange"> &
  Partial<Omit<CropperProps, "crop" | "onCropChange">>;

const Cropper = dynamic<LazyCropperProps>(
  () =>
    import("react-easy-crop").then(
      (module) => module.default as ComponentType<LazyCropperProps>,
    ),
  { ssr: false },
);

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

const notificationIcons: Record<DashboardNotificationIcon, AnimatedIcon> = {
  "calendar-days": CalendarDaysIcon,
  "badge-alert": BadgeAlertIcon,
  mailbox: MailboxIcon,
  blocks: BlocksIcon,
};

const focusableSettingsSectionIds = [
  "general",
  "perfil",
  "notificaciones",
] as const;

type FocusableSettingsSectionId = (typeof focusableSettingsSectionIds)[number];

function isFocusableSettingsSectionId(
  id: DashboardSettingsSectionId,
): id is FocusableSettingsSectionId {
  return focusableSettingsSectionIds.includes(id as FocusableSettingsSectionId);
}

type DashboardSettingsProfile = {
  firstName: string;
  lastName: string;
  email: string;
  profileImagePath: string | null;
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

const profilePhotoMaxSize = 5 * 1024 * 1024;
const profilePhotoAcceptedTypes = new Set(["image/png", "image/jpeg"]);
const profilePhotoOutputSize = 512;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function createCircularProfilePhotoBlob(
  imageSrc: string,
  cropArea: Area,
) {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context is not available.");
  }

  canvas.width = profilePhotoOutputSize;
  canvas.height = profilePhotoOutputSize;
  context.clearRect(0, 0, profilePhotoOutputSize, profilePhotoOutputSize);
  context.save();
  context.beginPath();
  context.arc(
    profilePhotoOutputSize / 2,
    profilePhotoOutputSize / 2,
    profilePhotoOutputSize / 2,
    0,
    Math.PI * 2,
  );
  context.closePath();
  context.clip();
  context.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    profilePhotoOutputSize,
    profilePhotoOutputSize,
  );
  context.restore();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Cropped image could not be created."));
    }, "image/png");
  });
}

function isMobileSessionDevice(deviceLabel: string) {
  const normalizedLabel = deviceLabel.toLowerCase();

  return (
    normalizedLabel.includes("iphone") ||
    normalizedLabel.includes("ipad") ||
    normalizedLabel.includes("android")
  );
}

function getSessionActivityIcon(deviceLabel: string): LucideIcon {
  return isMobileSessionDevice(deviceLabel) ? Smartphone : Laptop;
}

function formatSessionActivityTime(lastSeenAt: string, language: "es" | "en") {
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

function ViewportPortal({ children }: { children: ReactNode }) {
  return typeof document === "undefined"
    ? null
    : createPortal(children, document.body);
}

type SelectOption = {
  value: string;
  label: string;
};

function SettingsSelect({
  ariaLabel,
  Icon,
  id,
  onChange,
  options,
  value,
}: {
  ariaLabel: string;
  Icon?: AnimatedIcon;
  id: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  value: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<AnimatedIconHandle>(null);
  const iconAnimationTimeoutRef = useRef<number | null>(null);
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    return () => {
      if (iconAnimationTimeoutRef.current) {
        window.clearTimeout(iconAnimationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !Icon) {
      return;
    }

    if (iconAnimationTimeoutRef.current) {
      window.clearTimeout(iconAnimationTimeoutRef.current);
    }

    iconRef.current?.startAnimation();
    iconAnimationTimeoutRef.current = window.setTimeout(() => {
      iconRef.current?.stopAnimation();
      iconAnimationTimeoutRef.current = null;
    }, 700);
  }, [Icon, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateMenuRect = () => {
      const rect = buttonRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setMenuRect({
        left: rect.left,
        top: rect.bottom + 8,
        width: rect.width,
      });
    };

    updateMenuRect();
    window.addEventListener("resize", updateMenuRect);
    window.addEventListener("scroll", updateMenuRect, true);

    return () => {
      window.removeEventListener("resize", updateMenuRect);
      window.removeEventListener("scroll", updateMenuRect, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        buttonRef.current?.contains(target) ||
        listboxRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-3.5 pr-3 text-left text-sm font-semibold text-on-surface shadow-[0_1px_2px_rgb(13_13_18/0.04)] outline-none transition hover:border-outline hover:bg-surface focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          {Icon ? (
            <Icon
              ref={iconRef}
              aria-hidden="true"
              animateOnHover={false}
              className="shrink-0 text-on-surface-variant"
              size={18}
            />
          ) : null}
          <span className="min-w-0 truncate">{selectedOption.label}</span>
        </span>
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

      <ViewportPortal>
        <AnimatePresence>
          {isOpen && menuRect ? (
            <motion.div
              ref={listboxRef}
              role="listbox"
              aria-labelledby={id}
              style={{
                left: menuRect.left,
                top: menuRect.top,
                width: menuRect.width,
              }}
              className="fixed z-[80] overflow-hidden rounded-lg border border-outline-variant bg-popover p-1 text-popover-foreground shadow-[0_18px_40px_rgb(13_13_18/0.16)]"
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
      </ViewportPortal>
    </div>
  );
}

function SettingsToggleRow({
  ariaLabel,
  className,
  description,
  Icon,
  id,
  initiallyEnabled,
  title,
}: {
  ariaLabel: string;
  className?: string;
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
    <div
      className={cn(
        "flex min-w-0 items-center justify-between gap-4 text-left",
        className,
      )}
    >
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

function PasswordRequirementItem({
  isMet,
  label,
}: {
  isMet: boolean;
  label: string;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 transition-colors duration-200",
        isMet ? "text-chart-1" : "text-on-surface-variant",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full transition-colors duration-200",
          isMet ? "bg-chart-1" : "bg-outline",
        )}
      />
      <span>{label}</span>
    </li>
  );
}

function PasswordVisibilityToggle({
  isVisible,
  onToggle,
  showLabel,
  hideLabel,
}: {
  isVisible: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={isVisible ? hideLabel : showLabel}
      onClick={onToggle}
      className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="relative size-[18px]">
        <Eye
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
          className={cn(
            "absolute inset-0 transition duration-200 ease-out",
            isVisible ? "scale-75 opacity-0" : "scale-100 opacity-100",
          )}
        />
        <EyeOff
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
          className={cn(
            "absolute inset-0 transition duration-200 ease-out",
            isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
        />
      </span>
    </button>
  );
}

function SettingsFocusCard({
  activeSectionId,
  children,
  className,
  sectionId,
  shouldReduceMotion,
}: {
  activeSectionId: FocusableSettingsSectionId;
  children: ReactNode;
  className?: string;
  sectionId: FocusableSettingsSectionId;
  shouldReduceMotion: boolean;
}) {
  const isActive = sectionId === activeSectionId;

  return (
    <motion.section
      aria-hidden={isActive ? undefined : true}
      inert={isActive ? undefined : true}
      initial={false}
      className={cn(
        "relative w-full min-w-0 overflow-x-hidden overflow-y-auto rounded-xl bg-background px-4 pb-5 pt-3 text-left text-on-surface shadow-[0_8px_22px_-18px_rgb(13_13_18/0.36),0_1px_2px_rgb(13_13_18/0.04)] outline-none will-change-[filter,opacity] [backface-visibility:hidden] [transform:translateZ(0)] lg:min-h-0",
        "sm:px-5 sm:pb-6 sm:pt-4",
        isActive ? "z-10" : "pointer-events-none z-0",
        className,
      )}
      animate={{
        opacity: isActive ? 1 : 0.52,
        filter: isActive ? "blur(0px)" : "blur(2px)",
      }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              opacity: { duration: 0.24, ease: "easeOut" },
              filter: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
            }
      }
    >
      {children}
    </motion.section>
  );
}

function ConfiguracionGeneralPanel() {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const fallbackCopy = dashboardSettingsFallbackCopy[language];
  const [selectedCurrency, setSelectedCurrency] = useState("MXN");
  const [selectedDateFormat, setSelectedDateFormat] = useState("DD/MM/YYYY");
  const [selectedWeekStart, setSelectedWeekStart] = useState("monday");
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
  const dateFormatOptions = dashboardDateFormatOptions.map((option) => ({
    value: option.value,
    label: t(option.labelKey, {
      defaultValue: option.fallbackLabels[language],
    }),
  }));
  const weekStartOptions = dashboardWeekStartOptions.map((option) => ({
    value: option.value,
    label: t(option.labelKey, {
      defaultValue: option.fallbackLabels[language],
    }),
  }));

  return (
    <div className="w-full text-left">
      <h2 className="font-heading text-2xl font-semibold leading-8 tracking-normal text-on-surface">
        {t("dashboard.settings.general.title", {
          defaultValue: fallbackCopy.generalTitle,
        })}
      </h2>

      <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end">
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
            Icon={LanguagesIcon}
            ariaLabel={t("dashboard.settings.general.interfaceLanguage.label", {
              defaultValue: fallbackCopy.interfaceLanguageLabel,
            })}
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
            Icon={CircleDollarSignIcon}
            ariaLabel={t("dashboard.settings.general.currency.label", {
              defaultValue: fallbackCopy.currencyLabel,
            })}
            value={selectedCurrency}
            onChange={setSelectedCurrency}
            options={currencyOptions}
          />
        </div>
        <div className="block min-w-0">
          <label
            htmlFor="settings-date-format"
            className="mb-2 block text-sm font-medium leading-5 text-on-surface-variant"
          >
            {t("dashboard.settings.general.dateFormat.label", {
              defaultValue: fallbackCopy.dateFormatLabel,
            })}
          </label>
          <SettingsSelect
            id="settings-date-format"
            Icon={CalendarCogIcon}
            ariaLabel={t("dashboard.settings.general.dateFormat.label", {
              defaultValue: fallbackCopy.dateFormatLabel,
            })}
            value={selectedDateFormat}
            onChange={setSelectedDateFormat}
            options={dateFormatOptions}
          />
        </div>
        <div className="block min-w-0">
          <label
            htmlFor="settings-week-start"
            className="mb-2 block text-sm font-medium leading-5 text-on-surface-variant"
          >
            {t("dashboard.settings.general.weekStart.label", {
              defaultValue: fallbackCopy.weekStartLabel,
            })}
          </label>
          <SettingsSelect
            id="settings-week-start"
            Icon={CalendarCheck2Icon}
            ariaLabel={t("dashboard.settings.general.weekStart.label", {
              defaultValue: fallbackCopy.weekStartLabel,
            })}
            value={selectedWeekStart}
            onChange={setSelectedWeekStart}
            options={weekStartOptions}
          />
        </div>
        <div className="min-w-0">
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
              <SunMediumIcon ref={sunIconRef} aria-hidden="true" size={16} />
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
              <MoonIcon ref={moonIconRef} aria-hidden="true" size={16} />
              <span>
                {t("dashboard.settings.general.theme.dark", {
                  defaultValue: fallbackCopy.darkTheme,
                })}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfiguracionProfilePanel({
  user,
}: {
  user: DashboardSettingsProfile;
}) {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const fallbackCopy = dashboardSettingsFallbackCopy[language];
  const [state, formAction, isPending] = useActionState(
    updateUserProfileAction,
    initialProfileActionState,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoDragDepthRef = useRef(0);
  const avatarIconRef = useRef<AnimatedIconHandle>(null);
  const uploadIconRef = useRef<AnimatedIconHandle>(null);
  const deleteIconRef = useRef<AnimatedIconHandle>(null);
  const cancelIconRef = useRef<AnimatedIconHandle>(null);
  const saveIconRef = useRef<AnimatedIconHandle>(null);
  const cropModalIconRef = useRef<AnimatedIconHandle>(null);
  const cropCancelIconRef = useRef<AnimatedIconHandle>(null);
  const cropSaveIconRef = useRef<AnimatedIconHandle>(null);
  const firstNameIconRef = useRef<AnimatedIconHandle>(null);
  const lastNameIconRef = useRef<AnimatedIconHandle>(null);
  const shouldReduceMotion = useReducedMotion();
  const hiddenSavedMessageIdRef = useRef<string | null>(null);
  const [firstNameValue, setFirstNameValue] = useState(user.firstName);
  const [lastNameValue, setLastNameValue] = useState(user.lastName);
  const [profileImagePath, setProfileImagePath] = useState(
    user.profileImagePath,
  );
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isPhotoSaving, setIsPhotoSaving] = useState(false);
  const [isPhotoDeleting, setIsPhotoDeleting] = useState(false);
  const [isProfilePhotoDragActive, setIsProfilePhotoDragActive] =
    useState(false);
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
  const fieldClassName =
    "min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm font-medium text-on-surface shadow-[0_1px_2px_rgb(13_13_18/0.04)] outline-none transition placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/15";

  useEffect(() => {
    if (
      !savedMessage ||
      !savedMessageId ||
      savedMessageId === hiddenSavedMessageIdRef.current
    ) {
      return;
    }

    toast.success(savedMessage);
    hiddenSavedMessageIdRef.current = savedMessageId;
  }, [savedMessage, savedMessageId]);

  useEffect(() => {
    if (!selectedImageSrc) {
      return;
    }

    return () => URL.revokeObjectURL(selectedImageSrc);
  }, [selectedImageSrc]);

  const showProfilePhotoToast = (
    messageKey: string,
    defaultValue: string,
    variant: "success" | "error",
  ) => {
    const message = t(messageKey, { defaultValue });

    if (variant === "success") {
      toast.success(message);
      return;
    }

    toast.error(message);
  };

  const openProfilePhotoSelector = () => {
    fileInputRef.current?.click();
  };

  const closeCropModal = () => {
    setSelectedImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const loadProfilePhotoFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!profilePhotoAcceptedTypes.has(file.type)) {
      showProfilePhotoToast(
        "dashboard.settings.profile.photo.feedback.invalidType",
        fallbackCopy.profilePhotoInvalidType,
        "error",
      );
      return;
    }

    if (file.size > profilePhotoMaxSize) {
      showProfilePhotoToast(
        "dashboard.settings.profile.photo.feedback.tooLarge",
        fallbackCopy.profilePhotoTooLarge,
        "error",
      );
      return;
    }

    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setSelectedImageSrc(URL.createObjectURL(file));
  };

  const handleProfilePhotoFile = (event: ChangeEvent<HTMLInputElement>) => {
    loadProfilePhotoFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleProfilePhotoDragEnter = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    profilePhotoDragDepthRef.current += 1;

    if (profilePhotoDragDepthRef.current === 1) {
      setIsProfilePhotoDragActive(true);
      avatarIconRef.current?.startAnimation();
    }
  };

  const handleProfilePhotoDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleProfilePhotoDragLeave = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    profilePhotoDragDepthRef.current = Math.max(
      profilePhotoDragDepthRef.current - 1,
      0,
    );

    if (profilePhotoDragDepthRef.current === 0) {
      setIsProfilePhotoDragActive(false);
      avatarIconRef.current?.stopAnimation();
    }
  };

  const handleProfilePhotoDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    profilePhotoDragDepthRef.current = 0;
    setIsProfilePhotoDragActive(false);
    avatarIconRef.current?.stopAnimation();
    loadProfilePhotoFile(event.dataTransfer.files?.[0]);
  };

  const saveProfilePhoto = async () => {
    if (!selectedImageSrc || !croppedAreaPixels) {
      return;
    }

    setIsPhotoSaving(true);

    try {
      const croppedBlob = await createCircularProfilePhotoBlob(
        selectedImageSrc,
        croppedAreaPixels,
      );

      if (croppedBlob.size > profilePhotoMaxSize) {
        showProfilePhotoToast(
          "dashboard.settings.profile.photo.feedback.tooLarge",
          fallbackCopy.profilePhotoTooLarge,
          "error",
        );
        return;
      }

      const formData = new FormData();
      formData.append("file", croppedBlob, "profile.png");

      const response = await fetch("/api/profile-photo", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json().catch(() => ({}))) as {
        profileImagePath?: string | null;
        messageKey?: string;
      };

      if (!response.ok) {
        showProfilePhotoToast(
          result.messageKey ??
            "dashboard.settings.profile.photo.feedback.saveFailed",
          fallbackCopy.profilePhotoSaveFailed,
          "error",
        );
        return;
      }

      setProfileImagePath(result.profileImagePath ?? null);
      closeCropModal();
      showProfilePhotoToast(
        "dashboard.settings.profile.photo.feedback.saved",
        fallbackCopy.profilePhotoSaved,
        "success",
      );
      router.refresh();
    } catch {
      showProfilePhotoToast(
        "dashboard.settings.profile.photo.feedback.saveFailed",
        fallbackCopy.profilePhotoSaveFailed,
        "error",
      );
    } finally {
      setIsPhotoSaving(false);
    }
  };

  const deleteProfilePhoto = async () => {
    if (!profileImagePath || isPhotoDeleting) {
      return;
    }

    setIsPhotoDeleting(true);

    try {
      const response = await fetch("/api/profile-photo", {
        method: "DELETE",
      });
      const result = (await response.json().catch(() => ({}))) as {
        messageKey?: string;
      };

      if (!response.ok) {
        showProfilePhotoToast(
          result.messageKey ??
            "dashboard.settings.profile.photo.feedback.deleteFailed",
          fallbackCopy.profilePhotoDeleteFailed,
          "error",
        );
        return;
      }

      setProfileImagePath(null);
      showProfilePhotoToast(
        "dashboard.settings.profile.photo.feedback.deleted",
        fallbackCopy.profilePhotoDeleted,
        "success",
      );
      router.refresh();
    } catch {
      showProfilePhotoToast(
        "dashboard.settings.profile.photo.feedback.deleteFailed",
        fallbackCopy.profilePhotoDeleteFailed,
        "error",
      );
    } finally {
      setIsPhotoDeleting(false);
    }
  };

  return (
    <>
      <form action={formAction} className="w-full text-left">
        <h2 className="font-heading text-2xl font-semibold leading-8 tracking-normal text-on-surface">
          {t("dashboard.settings.profile.title", {
            defaultValue: fallbackCopy.profileTitle,
          })}
        </h2>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="sr-only"
          onChange={handleProfilePhotoFile}
        />

        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          <button
            type="button"
            aria-label={t("dashboard.settings.profile.photo.avatarLabel", {
              defaultValue: fallbackCopy.profileAvatarLabel,
            })}
            onClick={openProfilePhotoSelector}
            onDragEnter={handleProfilePhotoDragEnter}
            onDragOver={handleProfilePhotoDragOver}
            onDragLeave={handleProfilePhotoDragLeave}
            onDrop={handleProfilePhotoDrop}
            onFocus={() => avatarIconRef.current?.startAnimation()}
            onBlur={() => avatarIconRef.current?.stopAnimation()}
            onMouseEnter={() => avatarIconRef.current?.startAnimation()}
            onMouseLeave={() => avatarIconRef.current?.stopAnimation()}
            className={cn(
              "group relative inline-flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-surface-container-highest text-xl font-bold text-on-surface shadow-[inset_0_0_0_1px_rgb(255_255_255/0.16)] transition-[border-color,box-shadow,background-color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isProfilePhotoDragActive
                ? "border-primary bg-surface-container-low shadow-[0_0_0_4px_rgb(13_13_18/0.10)]"
                : "border-outline-variant",
            )}
          >
            {profileImagePath ? (
              <Image
                src={profileImagePath}
                alt=""
                width={96}
                height={96}
                unoptimized
                className="size-full object-cover"
              />
            ) : (
              <span aria-hidden="true">
                {(user.firstName || user.email).trim().charAt(0).toUpperCase()}
              </span>
            )}
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-primary/72 text-primary-foreground transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
                isProfilePhotoDragActive ? "opacity-100" : "opacity-0",
              )}
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
                onClick={openProfilePhotoSelector}
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
                disabled={!profileImagePath || isPhotoDeleting}
                onClick={deleteProfilePhoto}
                onFocus={() => deleteIconRef.current?.startAnimation()}
                onBlur={() => deleteIconRef.current?.stopAnimation()}
                onMouseEnter={() => deleteIconRef.current?.startAnimation()}
                onMouseLeave={() => deleteIconRef.current?.stopAnimation()}
                className={cn(
                  "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  profileImagePath && !isPhotoDeleting
                    ? "cursor-pointer bg-accent text-accent-foreground hover:bg-surface-container-highest"
                    : "cursor-not-allowed bg-surface-container text-on-surface-variant opacity-70",
                )}
              >
                <DeleteIcon
                  ref={deleteIconRef}
                  aria-hidden="true"
                  animateOnHover={false}
                  size={16}
                />
                {isPhotoDeleting
                  ? t("dashboard.settings.profile.photo.deleting", {
                      defaultValue: fallbackCopy.profilePhotoDeleting,
                    })
                  : t("dashboard.settings.profile.photo.delete", {
                      defaultValue: fallbackCopy.profileDelete,
                    })}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,0.72fr)_minmax(0,0.72fr)_auto] xl:items-end">
          <div className="min-w-0">
            <label
              htmlFor="profile-first-name"
              className="mb-2 block text-sm font-medium leading-5 text-on-surface-variant"
            >
              {t("dashboard.settings.profile.fields.firstName", {
                defaultValue: fallbackCopy.profileFirstName,
              })}
            </label>
            <div className="relative">
              <input
                id="profile-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={firstNameValue}
                onFocus={() => firstNameIconRef.current?.startAnimation()}
                onBlur={() => firstNameIconRef.current?.stopAnimation()}
                onChange={(event) => setFirstNameValue(event.target.value)}
                aria-invalid={Boolean(firstNameError)}
                aria-describedby={
                  firstNameError ? "profile-first-name-error" : undefined
                }
                className={cn(
                  fieldClassName,
                  "peer pl-12",
                  firstNameError
                    ? "border-destructive focus:border-destructive"
                    : "",
                )}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center text-on-surface-variant transition-colors duration-200 peer-focus:text-primary"
              >
                <UserIcon
                  ref={firstNameIconRef}
                  aria-hidden="true"
                  animateOnHover={false}
                  size={18}
                />
              </span>
            </div>
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
            <div className="relative">
              <input
                id="profile-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={lastNameValue}
                onFocus={() => lastNameIconRef.current?.startAnimation()}
                onBlur={() => lastNameIconRef.current?.stopAnimation()}
                onChange={(event) => setLastNameValue(event.target.value)}
                aria-invalid={Boolean(lastNameError)}
                aria-describedby={
                  lastNameError ? "profile-last-name-error" : undefined
                }
                className={cn(
                  fieldClassName,
                  "peer pl-12",
                  lastNameError
                    ? "border-destructive focus:border-destructive"
                    : "",
                )}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center text-on-surface-variant transition-colors duration-200 peer-focus:text-primary"
              >
                <UserIcon
                  ref={lastNameIconRef}
                  aria-hidden="true"
                  animateOnHover={false}
                  size={18}
                />
              </span>
            </div>
            {lastNameError ? (
              <p
                id="profile-last-name-error"
                className="mt-2 text-xs font-semibold text-destructive"
              >
                {lastNameError}
              </p>
            ) : null}
          </div>

          <div className="min-w-0">
            <label
              htmlFor="profile-email"
              className="mb-2 block text-sm font-medium leading-5 text-on-surface-variant"
            >
              {t("dashboard.settings.profile.fields.email", {
                defaultValue: fallbackCopy.profileEmail,
              })}
            </label>
            <div className="relative">
              <input
                id="profile-email"
                type="text"
                autoComplete="off"
                value={maskEmailForDisplay(user.email)}
                readOnly
                aria-readonly="true"
                className="min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container py-0 pl-12 pr-4 text-sm font-medium text-on-surface-variant outline-none"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center text-on-surface-variant"
              >
                <MailCheckIcon
                  aria-hidden="true"
                  animateOnHover={false}
                  size={18}
                />
              </span>
            </div>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-3 md:col-span-2 sm:flex-row sm:justify-start lg:col-span-3 xl:col-span-1 xl:mt-0 xl:flex-nowrap xl:justify-end">
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
              className="inline-flex min-h-11 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg border border-outline bg-surface-container-lowest px-5 text-sm font-semibold text-on-surface transition hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring xl:px-4"
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
                "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 text-sm font-bold transition-[background-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring xl:px-4",
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
      </form>

      <ViewportPortal>
        <AnimatePresence>
          {selectedImageSrc ? (
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
                aria-labelledby="profile-photo-crop-title"
                aria-describedby="profile-photo-crop-description"
                className="w-full max-w-[480px] rounded-2xl border border-border bg-popover p-5 text-popover-foreground shadow-[0_18px_40px_rgb(13_13_18/0.18)]"
                initial={
                  shouldReduceMotion
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: 0, y: 8, scale: 0.98 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0, y: 0, scale: 1 }
                    : { opacity: 0, y: 8, scale: 0.98 }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.18, ease: "easeOut" }
                }
              >
                <div className="flex min-w-0 items-center gap-3 text-left">
                  <span
                    aria-hidden="true"
                    onMouseEnter={() =>
                      cropModalIconRef.current?.startAnimation()
                    }
                    onMouseLeave={() =>
                      cropModalIconRef.current?.stopAnimation()
                    }
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface"
                  >
                    <SwitchCameraIcon
                      ref={cropModalIconRef}
                      aria-hidden="true"
                      animateOnHover={false}
                      size={20}
                    />
                  </span>
                  <div className="min-w-0">
                    <h3
                      id="profile-photo-crop-title"
                      className="break-words text-sm font-bold leading-5 text-on-surface"
                    >
                      {t("dashboard.settings.profile.photo.crop.title", {
                        defaultValue: fallbackCopy.profilePhotoCropTitle,
                      })}
                    </h3>
                    <p
                      id="profile-photo-crop-description"
                      className="mt-0.5 text-xs leading-[18px] text-on-surface-variant"
                    >
                      {t("dashboard.settings.profile.photo.crop.description", {
                        defaultValue: fallbackCopy.profilePhotoCropDescription,
                      })}
                    </p>
                  </div>
                </div>

                <div className="relative mt-5 h-[320px] overflow-hidden rounded-xl border border-border bg-surface-container">
                  <Cropper
                    image={selectedImageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, croppedAreaPixels) =>
                      setCroppedAreaPixels(croppedAreaPixels)
                    }
                    classes={{
                      containerClassName: "rounded-xl",
                    }}
                  />
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="profile-photo-zoom"
                    className="mb-2 block text-sm font-semibold leading-5 text-on-surface"
                  >
                    {t("dashboard.settings.profile.photo.crop.zoom", {
                      defaultValue: fallbackCopy.profilePhotoCropZoom,
                    })}
                  </label>
                  <input
                    id="profile-photo-zoom"
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={isPhotoSaving}
                    onClick={closeCropModal}
                    onFocus={() => cropCancelIconRef.current?.startAnimation()}
                    onBlur={() => cropCancelIconRef.current?.stopAnimation()}
                    onMouseEnter={() =>
                      cropCancelIconRef.current?.startAnimation()
                    }
                    onMouseLeave={() =>
                      cropCancelIconRef.current?.stopAnimation()
                    }
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline bg-surface-container-lowest px-5 text-sm font-semibold text-on-surface transition hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XIcon
                      ref={cropCancelIconRef}
                      aria-hidden="true"
                      animateOnHover={false}
                      size={16}
                    />
                    {t("dashboard.settings.profile.photo.crop.cancel", {
                      defaultValue: fallbackCopy.profilePhotoCropCancel,
                    })}
                  </button>
                  <button
                    type="button"
                    disabled={isPhotoSaving || !croppedAreaPixels}
                    onClick={saveProfilePhoto}
                    onFocus={() => cropSaveIconRef.current?.startAnimation()}
                    onBlur={() => cropSaveIconRef.current?.stopAnimation()}
                    onMouseEnter={() =>
                      cropSaveIconRef.current?.startAnimation()
                    }
                    onMouseLeave={() =>
                      cropSaveIconRef.current?.stopAnimation()
                    }
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CircleCheckIcon
                      ref={cropSaveIconRef}
                      aria-hidden="true"
                      animateOnHover={false}
                      size={18}
                    />
                    {isPhotoSaving
                      ? t("dashboard.settings.profile.photo.crop.saving", {
                          defaultValue: fallbackCopy.profilePhotoCropSaving,
                        })
                      : t("dashboard.settings.profile.photo.crop.save", {
                          defaultValue: fallbackCopy.profilePhotoCropSave,
                        })}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </ViewportPortal>
    </>
  );
}

function ConfiguracionNotificationsPanel() {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const fallbackCopy = dashboardSettingsFallbackCopy[language];
  const firstColumnOptions = dashboardNotificationOptions.slice(0, 3);
  const secondColumnOptions = dashboardNotificationOptions.slice(3);

  const renderNotificationToggle = (
    option: (typeof dashboardNotificationOptions)[number],
  ) => {
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
        className="py-0"
        title={title}
        description={description}
        ariaLabel={title}
        Icon={Icon}
        initiallyEnabled={option.initiallyEnabled}
      />
    );
  };

  return (
    <div className="w-full text-left">
      <h2 className="font-heading text-2xl font-semibold leading-8 tracking-normal text-on-surface">
        {t("dashboard.settings.notifications.title", {
          defaultValue: fallbackCopy.notificationsTitle,
        })}
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2 md:gap-x-8">
        <div className="grid gap-4">
          {firstColumnOptions.map(renderNotificationToggle)}
        </div>
        <div className="grid content-start gap-4 md:border-l md:border-border md:pl-8">
          {secondColumnOptions.map(renderNotificationToggle)}
        </div>
      </div>
    </div>
  );
}

function ConfiguracionSecurityPanel({
  userEmail,
  sessions,
}: {
  userEmail: string;
  sessions: DashboardSessionActivity[];
}) {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const fallbackCopy = dashboardSettingsFallbackCopy[language];
  const cancelDeleteAccountIconRef = useRef<AnimatedIconHandle>(null);
  const confirmDeleteAccountIconRef = useRef<AnimatedIconHandle>(null);
  const cancelDeletionCodeIconRef = useRef<AnimatedIconHandle>(null);
  const deleteWithCodeIconRef = useRef<AnimatedIconHandle>(null);
  const cancelSessionIconRef = useRef<AnimatedIconHandle>(null);
  const deleteAccountIconRef = useRef<AnimatedIconHandle>(null);
  const logoutSessionIconRef = useRef<AnimatedIconHandle>(null);
  const savePasswordIconRef = useRef<AnimatedIconHandle>(null);
  const cancelPasswordChangeIconRef = useRef<AnimatedIconHandle>(null);
  const verifyPasswordChangeIconRef = useRef<AnimatedIconHandle>(null);
  const passwordChangeCodeIconRef = useRef<AnimatedIconHandle>(null);
  const passwordChangeNoticeIconRef = useRef<AnimatedIconHandle>(null);
  const closeCurrentPasswordSessionIconRef = useRef<AnimatedIconHandle>(null);
  const closeAllPasswordSessionsIconRef = useRef<AnimatedIconHandle>(null);
  const currentPasswordIconRef = useRef<AnimatedIconHandle>(null);
  const newPasswordIconRef = useRef<AnimatedIconHandle>(null);
  const confirmPasswordIconRef = useRef<AnimatedIconHandle>(null);
  const deleteAccountPasswordIconRef = useRef<AnimatedIconHandle>(null);
  const [isDeleteAccountConfirmationOpen, setIsDeleteAccountConfirmationOpen] =
    useState(false);
  const [isDeleteAccountCodeOpen, setIsDeleteAccountCodeOpen] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [deleteAccountCode, setDeleteAccountCode] = useState("");
  const [deleteAccountState, setDeleteAccountState] =
    useState<DeleteAccountActionState | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteAccountPassword, setShowDeleteAccountPassword] =
    useState(false);
  const [passwordChangeCode, setPasswordChangeCode] = useState("");
  const [passwordChangeState, setPasswordChangeState] =
    useState<PasswordChangeActionState | null>(null);
  const [isPasswordChangeChallengeActive, setIsPasswordChangeChallengeActive] =
    useState(false);
  const [isPasswordChangeNoticeOpen, setIsPasswordChangeNoticeOpen] =
    useState(false);
  const [
    isPasswordChangeSessionChoiceOpen,
    setIsPasswordChangeSessionChoiceOpen,
  ] = useState(false);
  const [confirmation, setConfirmation] = useState<SessionConfirmation | null>(
    null,
  );
  const [sessionFeedbackKey, setSessionFeedbackKey] = useState<string | null>(
    null,
  );
  const [isSessionActionPending, startSessionActionTransition] =
    useTransition();
  const [isDeleteAccountActionPending, startDeleteAccountActionTransition] =
    useTransition();
  const [isPasswordChangeActionPending, startPasswordChangeActionTransition] =
    useTransition();
  const fieldClassName =
    "min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm font-medium text-on-surface shadow-[0_1px_2px_rgb(13_13_18/0.04)] outline-none transition placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/15";
  const destructiveActionClassName =
    "inline-flex min-h-9 cursor-pointer items-center justify-center rounded-lg border border-destructive bg-surface-container-lowest px-4 text-xs font-bold leading-4 text-destructive shadow-[0_1px_2px_rgb(13_13_18/0.04)] transition-colors duration-200 hover:bg-destructive hover:text-destructive-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  const signOutTextActionClassName =
    "inline-flex cursor-pointer border-0 bg-transparent p-0 text-xs font-bold leading-4 text-destructive shadow-none transition-opacity duration-200 hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  const passwordPlaceholder = t("common.passwordPlaceholder", {
    defaultValue: "••••••••",
  });
  const passwordFields = [
    {
      id: "security-current-password",
      name: "currentPassword",
      inputName: "security-entry-current",
      labelKey: "dashboard.settings.security.password.fields.current",
      fallback: fallbackCopy.securityCurrentPassword,
      value: currentPassword,
      onChange: setCurrentPassword,
      icon: LockKeyholeIcon,
      iconRef: currentPasswordIconRef,
      isVisible: showCurrentPassword,
      onToggleVisibility: () => setShowCurrentPassword((current) => !current),
    },
    {
      id: "security-new-password",
      name: "newPassword",
      inputName: "security-entry-new",
      labelKey: "dashboard.settings.security.password.fields.new",
      fallback: fallbackCopy.securityNewPassword,
      value: newPassword,
      onChange: setNewPassword,
      icon: LockKeyholeOpenIcon,
      iconRef: newPasswordIconRef,
      isVisible: showNewPassword,
      onToggleVisibility: () => setShowNewPassword((current) => !current),
    },
    {
      id: "security-confirm-password",
      name: "confirmPassword",
      inputName: "security-entry-confirm",
      labelKey: "dashboard.settings.security.password.fields.confirm",
      fallback: fallbackCopy.securityConfirmPassword,
      value: confirmPassword,
      onChange: setConfirmPassword,
      icon: LockKeyholeOpenIcon,
      iconRef: confirmPasswordIconRef,
      isVisible: showConfirmPassword,
      onToggleVisibility: () => setShowConfirmPassword((current) => !current),
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
  const getMaskedEmail = (email: string) => {
    const [localPart, domain] = email.split("@");

    if (!localPart || !domain) {
      return email;
    }

    return `${localPart.slice(0, 2)}${"*".repeat(
      Math.max(localPart.length - 2, 1),
    )}@${domain}`;
  };
  const normalizedPasswordChangeCode = passwordChangeCode
    .replace(/\D/g, "")
    .slice(0, 6);
  const passwordChangeCodeIsValid = normalizedPasswordChangeCode.length === 6;
  const passwordChangeFieldsAreComplete =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0;
  const passwordRequirements = useMemo(
    () => getPasswordRequirements(newPassword),
    [newPassword],
  );
  const confirmPasswordDoesNotMatch = shouldShowPasswordMismatch(
    newPassword,
    confirmPassword,
  );
  const confirmPasswordMatches =
    confirmPassword.length > 0 && confirmPassword === newPassword;
  const passwordFieldsAreDisabled =
    isPasswordChangeChallengeActive ||
    isPasswordChangeActionPending ||
    isPasswordChangeSessionChoiceOpen;
  const passwordChangeMaskedEmail =
    passwordChangeState?.maskedEmail ?? getMaskedEmail(userEmail);
  const getPasswordChangeFieldError = (
    field: "currentPassword" | "newPassword" | "confirmPassword" | "code",
  ) =>
    passwordChangeState?.status === "error" &&
    passwordChangeState.errors?.[field]
      ? passwordChangeState.errors[field]
      : null;
  const requestPasswordChangeCode = () => {
    if (
      !passwordChangeFieldsAreComplete ||
      isPasswordChangeChallengeActive ||
      isPasswordChangeActionPending ||
      isPasswordChangeSessionChoiceOpen
    ) {
      return;
    }

    startPasswordChangeActionTransition(() => {
      void (async () => {
        const formData = new FormData();
        formData.set("currentPassword", currentPassword);
        formData.set("newPassword", newPassword);
        formData.set("confirmPassword", confirmPassword);
        formData.set("language", i18n.resolvedLanguage ?? i18n.language);
        const result = await requestPasswordChangeCodeAction(formData);

        setPasswordChangeState(result);

        if (result.status === "success") {
          setPasswordChangeCode("");
          setShowCurrentPassword(false);
          setShowNewPassword(false);
          setShowConfirmPassword(false);
          setIsPasswordChangeChallengeActive(true);
          setIsPasswordChangeNoticeOpen(true);
        }
      })();
    });
  };
  const handlePasswordChangeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPasswordChangeChallengeActive) {
      confirmPasswordChange();
      return;
    }

    requestPasswordChangeCode();
  };
  const cancelPasswordChange = () => {
    startPasswordChangeActionTransition(() => {
      void (async () => {
        await cancelPasswordChangeAction();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setPasswordChangeCode("");
        setPasswordChangeState(null);
        setIsPasswordChangeChallengeActive(false);
        setIsPasswordChangeNoticeOpen(false);
      })();
    });
  };
  const confirmPasswordChange = () => {
    if (!passwordChangeCodeIsValid || isPasswordChangeActionPending) {
      return;
    }

    startPasswordChangeActionTransition(() => {
      void (async () => {
        const formData = new FormData();
        formData.set("code", normalizedPasswordChangeCode);
        formData.set("newPassword", newPassword);
        formData.set("confirmPassword", confirmPassword);
        const result = await confirmPasswordChangeAction(formData);

        setPasswordChangeState(result);

        if (result.status === "success") {
          setPasswordChangeCode("");
          setIsPasswordChangeChallengeActive(false);
          setIsPasswordChangeNoticeOpen(false);
          setIsPasswordChangeSessionChoiceOpen(true);
          router.refresh();
        }
      })();
    });
  };
  const finishPasswordChangeSession = (mode: PasswordChangeSessionMode) => {
    startPasswordChangeActionTransition(() => {
      void completePasswordChangeSessionAction(mode);
    });
  };
  const normalizedDeleteAccountCode = deleteAccountCode
    .replace(/\D/g, "")
    .slice(0, 6);
  const deleteAccountCodeIsValid = normalizedDeleteAccountCode.length === 6;
  const deleteAccountMaskedEmail =
    deleteAccountState?.maskedEmail ?? getMaskedEmail(userEmail);
  const openDeleteAccountConfirmation = () => {
    setDeleteAccountPassword("");
    setDeleteAccountCode("");
    setDeleteAccountState(null);
    setShowDeleteAccountPassword(false);
    setIsDeleteAccountConfirmationOpen(true);
  };
  const closeDeleteAccountConfirmation = () => {
    setIsDeleteAccountConfirmationOpen(false);
    setDeleteAccountPassword("");
    setDeleteAccountState(null);
    setShowDeleteAccountPassword(false);
  };
  const requestDeleteAccountCode = () => {
    if (!deleteAccountPassword) {
      return;
    }

    startDeleteAccountActionTransition(() => {
      void (async () => {
        const formData = new FormData();
        formData.set("password", deleteAccountPassword);
        formData.set("language", i18n.resolvedLanguage ?? i18n.language);
        const result = await requestAccountDeletionCodeAction(formData);

        setDeleteAccountState(result);

        if (result.status === "success") {
          setIsDeleteAccountConfirmationOpen(false);
          setShowDeleteAccountPassword(false);
          setDeleteAccountCode("");
          setIsDeleteAccountCodeOpen(true);
        }
      })();
    });
  };
  const cancelDeleteAccountCode = () => {
    startDeleteAccountActionTransition(() => {
      void (async () => {
        await cancelAccountDeletionAction();
        setIsDeleteAccountCodeOpen(false);
        setDeleteAccountCode("");
        setDeleteAccountState(null);
      })();
    });
  };
  const confirmDeleteAccount = () => {
    if (!deleteAccountCodeIsValid) {
      return;
    }

    startDeleteAccountActionTransition(() => {
      void (async () => {
        const formData = new FormData();
        formData.set("code", normalizedDeleteAccountCode);
        const result = await confirmAccountDeletionAction(formData);

        if (result?.status === "error") {
          setDeleteAccountState(result);
        }
      })();
    });
  };

  return (
    <div className="w-full text-left">
      <div className="rounded-xl bg-background px-4 pb-5 pt-3 text-on-surface shadow-[0_8px_22px_-18px_rgb(13_13_18/0.36),0_1px_2px_rgb(13_13_18/0.04)] sm:px-5 sm:pb-6 sm:pt-4">
        <h2 className="font-heading text-2xl font-semibold leading-8 tracking-normal text-on-surface">
          {t("dashboard.settings.security.title", {
            defaultValue: fallbackCopy.securityTitle,
          })}
        </h2>

        <div className="mt-5 grid gap-y-9 lg:grid-cols-3 lg:gap-x-8">
          <section
            aria-labelledby="security-2fa-title"
            className="rounded-xl border border-outline-variant bg-accent/55 p-4 text-on-surface sm:p-5 lg:col-span-2"
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

          <div className="lg:row-span-2 lg:border-l lg:border-border lg:pl-8">
            <section
              aria-labelledby="security-danger-title"
              className="rounded-xl border border-destructive/25 bg-destructive-container/35 p-5 text-on-surface"
            >
              <h3
                id="security-danger-title"
                className="text-base font-bold leading-3 text-destructive"
              >
                {t("dashboard.settings.security.dangerZone.title", {
                  defaultValue: fallbackCopy.securityDangerTitle,
                })}
              </h3>
              <p className="mt-3 text-sm leading-5 text-on-surface-variant">
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
                onClick={openDeleteAccountConfirmation}
                className={cn(
                  destructiveActionClassName,
                  "mt-5 min-h-11 w-full gap-2 px-5 text-sm",
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

          <form
            aria-labelledby="security-password-title"
            autoComplete="off"
            className="min-w-0"
            onSubmit={handlePasswordChangeSubmit}
          >
            <h3
              id="security-password-title"
              className="text-base font-bold leading-6 text-on-surface"
            >
              {t("dashboard.settings.security.password.title", {
                defaultValue: fallbackCopy.securityPasswordTitle,
              })}
            </h3>
            <div className="mt-4 grid gap-4">
              {passwordFields.map((field) => {
                const PasswordIcon = field.icon;

                return (
                  <div key={field.id} className="min-w-0">
                    <label
                      htmlFor={field.id}
                      className="mb-2 block text-sm font-medium leading-5 text-on-surface-variant"
                    >
                      {t(field.labelKey, { defaultValue: field.fallback })}
                    </label>
                    <div className="relative">
                      <input
                        id={field.id}
                        name={field.inputName}
                        type={field.isVisible ? "text" : "password"}
                        autoComplete="new-password"
                        autoCapitalize="none"
                        autoCorrect="off"
                        data-1p-ignore="true"
                        data-bwignore="true"
                        data-form-type="other"
                        data-lpignore="true"
                        disabled={passwordFieldsAreDisabled}
                        value={field.value}
                        aria-invalid={
                          field.name === "confirmPassword"
                            ? confirmPasswordDoesNotMatch ||
                              Boolean(
                                getPasswordChangeFieldError("confirmPassword"),
                              )
                            : Boolean(
                                getPasswordChangeFieldError(
                                  field.name as
                                    | "currentPassword"
                                    | "newPassword"
                                    | "confirmPassword",
                                ),
                              )
                        }
                        aria-describedby={
                          field.name === "confirmPassword" &&
                          (confirmPassword.length > 0 ||
                            getPasswordChangeFieldError("confirmPassword"))
                            ? "security-confirm-password-feedback"
                            : undefined
                        }
                        onFocus={() => field.iconRef.current?.startAnimation()}
                        onBlur={() => field.iconRef.current?.stopAnimation()}
                        onChange={(event) => {
                          field.onChange(event.target.value);
                          setPasswordChangeState(null);
                        }}
                        placeholder={passwordPlaceholder}
                        className={cn(
                          fieldClassName,
                          "peer pl-12 pr-14 disabled:cursor-not-allowed disabled:opacity-60",
                        )}
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center text-on-surface-variant transition-colors duration-200 peer-focus:text-primary peer-disabled:opacity-60"
                      >
                        <PasswordIcon
                          ref={field.iconRef}
                          aria-hidden="true"
                          animateOnHover={false}
                          size={18}
                        />
                      </span>
                      <PasswordVisibilityToggle
                        isVisible={field.isVisible}
                        onToggle={field.onToggleVisibility}
                        showLabel={t("common.showPassword")}
                        hideLabel={t("common.hidePassword")}
                      />
                    </div>
                    {field.name === "newPassword" ? (
                      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-medium">
                        {passwordRequirements.map((requirement) => (
                          <PasswordRequirementItem
                            key={requirement.labelKey}
                            isMet={requirement.isMet}
                            label={t(requirement.labelKey)}
                          />
                        ))}
                      </ul>
                    ) : null}
                    {field.name === "confirmPassword" ? (
                      <AnimatedFormMessage
                        id="security-confirm-password-feedback"
                        message={
                          getPasswordChangeFieldError("confirmPassword")
                            ? t(
                                getPasswordChangeFieldError(
                                  "confirmPassword",
                                ) ?? "",
                                {
                                  defaultValue:
                                    fallbackCopy.securityPasswordActionFeedback,
                                },
                              )
                            : confirmPasswordDoesNotMatch
                              ? t("validation.passwordMismatch")
                              : confirmPasswordMatches
                                ? t(
                                    "dashboard.settings.security.password.feedback.confirmMatch",
                                    {
                                      defaultValue:
                                        fallbackCopy.securityPasswordConfirmMatch,
                                    },
                                  )
                                : undefined
                        }
                        tone={
                          getPasswordChangeFieldError("confirmPassword") ||
                          confirmPasswordDoesNotMatch
                            ? "error"
                            : "success"
                        }
                        role={
                          getPasswordChangeFieldError("confirmPassword") ||
                          confirmPasswordDoesNotMatch
                            ? "alert"
                            : "status"
                        }
                        spacingClassName="pt-2"
                      />
                    ) : null}
                    {getPasswordChangeFieldError(
                      field.name as
                        | "currentPassword"
                        | "newPassword"
                        | "confirmPassword",
                    ) && field.name !== "confirmPassword" ? (
                      <p className="mt-2 text-xs font-semibold text-destructive">
                        {t(
                          getPasswordChangeFieldError(
                            field.name as
                              | "currentPassword"
                              | "newPassword"
                              | "confirmPassword",
                          ) ?? "",
                          {
                            defaultValue:
                              fallbackCopy.securityPasswordActionFeedback,
                          },
                        )}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={
                  isPasswordChangeActionPending ||
                  isPasswordChangeChallengeActive ||
                  !passwordChangeFieldsAreComplete
                }
                onFocus={() => savePasswordIconRef.current?.startAnimation()}
                onBlur={() => savePasswordIconRef.current?.stopAnimation()}
                onMouseEnter={() =>
                  savePasswordIconRef.current?.startAnimation()
                }
                onMouseLeave={() =>
                  savePasswordIconRef.current?.stopAnimation()
                }
                className={cn(
                  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition-[background-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  passwordChangeFieldsAreComplete &&
                    !isPasswordChangeActionPending &&
                    !isPasswordChangeChallengeActive
                    ? "cursor-pointer bg-primary text-primary-foreground shadow-[0_8px_20px_rgb(13_13_18/0.16)] hover:bg-primary/90"
                    : "cursor-not-allowed bg-surface-container-high text-on-surface-variant shadow-none",
                )}
              >
                <CircleCheckIcon
                  ref={savePasswordIconRef}
                  aria-hidden="true"
                  animateOnHover={false}
                  size={16}
                />
                {isPasswordChangeActionPending &&
                !isPasswordChangeChallengeActive
                  ? t("dashboard.settings.security.password.actions.sending", {
                      defaultValue: fallbackCopy.securityPasswordSendingCode,
                    })
                  : t("dashboard.settings.security.password.actions.save", {
                      defaultValue: fallbackCopy.securityPasswordSave,
                    })}
              </button>
            </div>
            {passwordChangeState?.status === "error" &&
            !passwordChangeState.errors ? (
              <p className="mt-3 text-sm font-semibold text-destructive">
                {t(passwordChangeState.messageKey, {
                  defaultValue: fallbackCopy.securityPasswordActionFeedback,
                })}
              </p>
            ) : null}
            <AnimatePresence initial={false}>
              {isPasswordChangeChallengeActive ? (
                <motion.div
                  className="mt-5 rounded-xl border border-outline-variant bg-surface-container-low p-4"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <label
                    htmlFor="security-password-change-code"
                    className="mb-2 block text-sm font-semibold leading-5 text-on-surface"
                  >
                    {t("dashboard.settings.security.password.codeLabel", {
                      defaultValue: fallbackCopy.securityPasswordCodeLabel,
                    })}
                  </label>
                  <div className="relative">
                    <input
                      id="security-password-change-code"
                      name="code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={6}
                      value={normalizedPasswordChangeCode}
                      onChange={(event) => {
                        setPasswordChangeCode(event.target.value);
                        setPasswordChangeState(null);
                      }}
                      onFocus={() =>
                        passwordChangeCodeIconRef.current?.startAnimation()
                      }
                      onBlur={() =>
                        passwordChangeCodeIconRef.current?.stopAnimation()
                      }
                      placeholder={t("recovery.verificationCodePlaceholder", {
                        defaultValue: "000000",
                      })}
                      className={cn(
                        fieldClassName,
                        "peer pl-12 font-mono tracking-[0.16em]",
                      )}
                    />
                    <KeyIcon
                      ref={passwordChangeCodeIconRef}
                      aria-hidden="true"
                      animateOnHover={false}
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors duration-200 peer-focus:text-primary"
                    />
                  </div>
                  {getPasswordChangeFieldError("code") ? (
                    <p className="mt-2 text-xs font-semibold text-destructive">
                      {t(getPasswordChangeFieldError("code") ?? "", {
                        defaultValue:
                          fallbackCopy.securityPasswordActionFeedback,
                      })}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={isPasswordChangeActionPending}
                      onClick={cancelPasswordChange}
                      onFocus={() =>
                        cancelPasswordChangeIconRef.current?.startAnimation()
                      }
                      onBlur={() =>
                        cancelPasswordChangeIconRef.current?.stopAnimation()
                      }
                      onMouseEnter={() =>
                        cancelPasswordChangeIconRef.current?.startAnimation()
                      }
                      onMouseLeave={() =>
                        cancelPasswordChangeIconRef.current?.stopAnimation()
                      }
                      className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline bg-surface-container-lowest px-5 text-sm font-semibold text-on-surface transition hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <XIcon
                        ref={cancelPasswordChangeIconRef}
                        aria-hidden="true"
                        animateOnHover={false}
                        size={16}
                      />
                      {t(
                        "dashboard.settings.security.password.actions.cancel",
                        {
                          defaultValue:
                            fallbackCopy.securityDeleteAccountConfirmCancel,
                        },
                      )}
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isPasswordChangeActionPending ||
                        !passwordChangeCodeIsValid
                      }
                      onFocus={() =>
                        verifyPasswordChangeIconRef.current?.startAnimation()
                      }
                      onBlur={() =>
                        verifyPasswordChangeIconRef.current?.stopAnimation()
                      }
                      onMouseEnter={() =>
                        verifyPasswordChangeIconRef.current?.startAnimation()
                      }
                      onMouseLeave={() =>
                        verifyPasswordChangeIconRef.current?.stopAnimation()
                      }
                      className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCheckIcon
                        ref={verifyPasswordChangeIconRef}
                        aria-hidden="true"
                        animateOnHover={false}
                        size={16}
                      />
                      {isPasswordChangeActionPending
                        ? t(
                            "dashboard.settings.security.password.actions.verifying",
                            {
                              defaultValue:
                                fallbackCopy.securityPasswordVerifying,
                            },
                          )
                        : t(
                            "dashboard.settings.security.password.actions.verify",
                            {
                              defaultValue: fallbackCopy.securityPasswordVerify,
                            },
                          )}
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </form>

          <section
            aria-labelledby="security-activity-title"
            className="min-w-0 lg:border-l lg:border-border lg:pl-8"
          >
            <div className="flex items-center justify-between gap-3">
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
                  const ActivityIcon = getSessionActivityIcon(deviceLabel);

                  return (
                    <div
                      key={session.id}
                      className="flex items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <ActivityIcon
                          aria-hidden="true"
                          size={20}
                          className="mt-0.5 shrink-0 text-on-surface-variant"
                        />
                        <div className="min-w-0">
                          <p className="break-words text-sm font-bold leading-5 text-on-surface">
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
                        <span className="shrink-0 pt-5 text-right text-xs font-bold leading-4 text-chart-1">
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
                            "shrink-0 pt-5 text-right disabled:cursor-not-allowed disabled:opacity-45",
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

      <ViewportPortal>
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
                    onFocus={() =>
                      cancelSessionIconRef.current?.startAnimation()
                    }
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
                    {t(
                      "dashboard.settings.security.recentActivity.confirm.cancel",
                      {
                        defaultValue: fallbackCopy.securityConfirmCancel,
                      },
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isSessionActionPending}
                    onClick={executeConfirmedSessionAction}
                    onFocus={() =>
                      logoutSessionIconRef.current?.startAnimation()
                    }
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
                          confirmation.type === "all"
                            ? "dashboard.settings.security.recentActivity.confirm.confirmAll"
                            : "dashboard.settings.security.recentActivity.confirm.confirm",
                          {
                            defaultValue:
                              confirmation.type === "all"
                                ? fallbackCopy.securityConfirmAllAction
                                : fallbackCopy.securityConfirmAction,
                          },
                        )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {isPasswordChangeNoticeOpen ? (
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
                aria-labelledby="password-change-notice-title"
                aria-describedby="password-change-notice-description"
                className="w-full max-w-[430px] rounded-2xl border border-border bg-popover p-5 text-popover-foreground shadow-[0_18px_40px_rgb(13_13_18/0.18)]"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <div className="flex min-w-0 items-center gap-3 text-left">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  >
                    <MailboxIcon
                      aria-hidden="true"
                      className="shrink-0"
                      size={20}
                    />
                  </span>
                  <h3
                    id="password-change-notice-title"
                    className="break-words text-sm font-bold leading-5 text-on-surface"
                  >
                    {t("dashboard.settings.security.password.notice.title", {
                      defaultValue: fallbackCopy.securityPasswordNoticeTitle,
                    })}
                  </h3>
                </div>
                <p
                  id="password-change-notice-description"
                  className="mt-4 text-sm leading-5 text-on-surface-variant"
                >
                  {t("dashboard.settings.security.password.notice.body", {
                    defaultValue: fallbackCopy.securityPasswordNoticeBody,
                    email: passwordChangeMaskedEmail,
                  })}
                </p>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsPasswordChangeNoticeOpen(false)}
                    onFocus={() =>
                      passwordChangeNoticeIconRef.current?.startAnimation()
                    }
                    onBlur={() =>
                      passwordChangeNoticeIconRef.current?.stopAnimation()
                    }
                    onMouseEnter={() =>
                      passwordChangeNoticeIconRef.current?.startAnimation()
                    }
                    onMouseLeave={() =>
                      passwordChangeNoticeIconRef.current?.stopAnimation()
                    }
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <CircleCheckIcon
                      ref={passwordChangeNoticeIconRef}
                      aria-hidden="true"
                      animateOnHover={false}
                      size={16}
                    />
                    {t("dashboard.settings.security.password.notice.action", {
                      defaultValue: fallbackCopy.securityPasswordNoticeAction,
                    })}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {isPasswordChangeSessionChoiceOpen ? (
            <motion.div
              role="presentation"
              className="fixed inset-0 z-[60] grid place-items-center bg-inverse-surface/45 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="password-change-session-title"
                aria-describedby="password-change-session-description"
                className="w-full max-w-[460px] rounded-2xl border border-border bg-popover p-5 text-popover-foreground shadow-[0_18px_40px_rgb(13_13_18/0.18)]"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <div className="flex min-w-0 items-center gap-3 text-left">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  >
                    <CircleCheckIcon
                      aria-hidden="true"
                      className="shrink-0"
                      size={20}
                    />
                  </span>
                  <h3
                    id="password-change-session-title"
                    className="break-words text-sm font-bold leading-5 text-on-surface"
                  >
                    {t("dashboard.settings.security.password.session.title", {
                      defaultValue: fallbackCopy.securityPasswordSessionTitle,
                    })}
                  </h3>
                </div>
                <p
                  id="password-change-session-description"
                  className="mt-4 text-sm leading-5 text-on-surface-variant"
                >
                  {t("dashboard.settings.security.password.session.body", {
                    defaultValue: fallbackCopy.securityPasswordSessionBody,
                  })}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={isPasswordChangeActionPending}
                    onClick={() => finishPasswordChangeSession("current")}
                    onFocus={() =>
                      closeCurrentPasswordSessionIconRef.current?.startAnimation()
                    }
                    onBlur={() =>
                      closeCurrentPasswordSessionIconRef.current?.stopAnimation()
                    }
                    onMouseEnter={() =>
                      closeCurrentPasswordSessionIconRef.current?.startAnimation()
                    }
                    onMouseLeave={() =>
                      closeCurrentPasswordSessionIconRef.current?.stopAnimation()
                    }
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline bg-surface-container-lowest px-4 text-sm font-semibold text-on-surface transition hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogoutIcon
                      ref={closeCurrentPasswordSessionIconRef}
                      aria-hidden="true"
                      animateOnHover={false}
                      size={16}
                    />
                    {t(
                      "dashboard.settings.security.password.session.closeCurrent",
                      {
                        defaultValue: fallbackCopy.securityPasswordCloseCurrent,
                      },
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isPasswordChangeActionPending}
                    onClick={() => finishPasswordChangeSession("all")}
                    onFocus={() =>
                      closeAllPasswordSessionsIconRef.current?.startAnimation()
                    }
                    onBlur={() =>
                      closeAllPasswordSessionsIconRef.current?.stopAnimation()
                    }
                    onMouseEnter={() =>
                      closeAllPasswordSessionsIconRef.current?.startAnimation()
                    }
                    onMouseLeave={() =>
                      closeAllPasswordSessionsIconRef.current?.stopAnimation()
                    }
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogoutIcon
                      ref={closeAllPasswordSessionsIconRef}
                      aria-hidden="true"
                      animateOnHover={false}
                      size={16}
                    />
                    {t(
                      "dashboard.settings.security.password.session.closeAll",
                      {
                        defaultValue: fallbackCopy.securityPasswordCloseAll,
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
                <div className="mt-5">
                  <label
                    htmlFor="delete-account-password"
                    className="mb-2 block text-sm font-semibold leading-5 text-on-surface"
                  >
                    {t(
                      "dashboard.settings.security.dangerZone.confirm.passwordLabel",
                      {
                        defaultValue:
                          fallbackCopy.securityDeleteAccountPasswordLabel,
                      },
                    )}
                  </label>
                  <div className="relative">
                    <input
                      id="delete-account-password"
                      type={showDeleteAccountPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={deleteAccountPassword}
                      onFocus={() =>
                        deleteAccountPasswordIconRef.current?.startAnimation()
                      }
                      onBlur={() =>
                        deleteAccountPasswordIconRef.current?.stopAnimation()
                      }
                      onChange={(event) =>
                        setDeleteAccountPassword(event.target.value)
                      }
                      className={cn(fieldClassName, "peer pl-12 pr-14")}
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center text-on-surface-variant transition-colors duration-200 peer-focus:text-primary"
                    >
                      <LockKeyholeIcon
                        ref={deleteAccountPasswordIconRef}
                        aria-hidden="true"
                        animateOnHover={false}
                        size={18}
                      />
                    </span>
                    <PasswordVisibilityToggle
                      isVisible={showDeleteAccountPassword}
                      onToggle={() =>
                        setShowDeleteAccountPassword((current) => !current)
                      }
                      showLabel={t("common.showPassword")}
                      hideLabel={t("common.hidePassword")}
                    />
                  </div>
                  {deleteAccountState?.status === "error" ? (
                    <p className="mt-2 text-xs font-semibold text-destructive">
                      {t(deleteAccountState.messageKey, {
                        defaultValue:
                          fallbackCopy.securityDeleteAccountActionFeedback,
                      })}
                    </p>
                  ) : null}
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={isDeleteAccountActionPending}
                    onClick={closeDeleteAccountConfirmation}
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
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline bg-surface-container-lowest px-5 text-sm font-semibold text-on-surface transition hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XIcon
                      ref={cancelDeleteAccountIconRef}
                      aria-hidden="true"
                      animateOnHover={false}
                      size={16}
                    />
                    {t(
                      "dashboard.settings.security.dangerZone.confirm.cancel",
                      {
                        defaultValue:
                          fallbackCopy.securityDeleteAccountConfirmCancel,
                      },
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={
                      isDeleteAccountActionPending || !deleteAccountPassword
                    }
                    onClick={requestDeleteAccountCode}
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
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-destructive px-5 text-sm font-bold text-destructive-foreground transition hover:bg-destructive/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <DeleteIcon
                      ref={confirmDeleteAccountIconRef}
                      aria-hidden="true"
                      animateOnHover={false}
                      size={16}
                    />
                    {isDeleteAccountActionPending
                      ? t(
                          "dashboard.settings.security.dangerZone.confirm.sending",
                          {
                            defaultValue:
                              fallbackCopy.securityDeleteAccountSendingCode,
                          },
                        )
                      : t(
                          "dashboard.settings.security.dangerZone.confirm.confirm",
                          {
                            defaultValue:
                              fallbackCopy.securityDeleteAccountConfirmAction,
                          },
                        )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {isDeleteAccountCodeOpen ? (
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
                aria-labelledby="delete-account-code-title"
                aria-describedby="delete-account-code-description"
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
                    id="delete-account-code-title"
                    className="break-words text-sm font-bold leading-5 text-on-surface"
                  >
                    {t(
                      "dashboard.settings.security.dangerZone.confirm.codeTitle",
                      {
                        defaultValue:
                          fallbackCopy.securityDeleteAccountCodeTitle,
                      },
                    )}
                  </h3>
                </div>
                <p
                  id="delete-account-code-description"
                  className="mt-4 text-sm leading-5 text-on-surface-variant"
                >
                  {t(
                    "dashboard.settings.security.dangerZone.confirm.codeBody",
                    {
                      defaultValue: fallbackCopy.securityDeleteAccountCodeBody,
                      email: deleteAccountMaskedEmail,
                    },
                  )}
                </p>
                <div className="mt-5">
                  <label
                    htmlFor="delete-account-code"
                    className="mb-2 block text-sm font-semibold leading-5 text-on-surface"
                  >
                    {t("recovery.verificationCode", {
                      defaultValue: fallbackCopy.securityDeleteAccountCodeLabel,
                    })}
                  </label>
                  <input
                    id="delete-account-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={normalizedDeleteAccountCode}
                    onChange={(event) =>
                      setDeleteAccountCode(event.target.value)
                    }
                    className={cn(
                      fieldClassName,
                      "font-mono tracking-[0.16em]",
                    )}
                  />
                  {deleteAccountState?.status === "error" ? (
                    <p className="mt-2 text-xs font-semibold text-destructive">
                      {t(deleteAccountState.messageKey, {
                        defaultValue:
                          fallbackCopy.securityDeleteAccountActionFeedback,
                      })}
                    </p>
                  ) : null}
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={isDeleteAccountActionPending}
                    onClick={cancelDeleteAccountCode}
                    onFocus={() =>
                      cancelDeletionCodeIconRef.current?.startAnimation()
                    }
                    onBlur={() =>
                      cancelDeletionCodeIconRef.current?.stopAnimation()
                    }
                    onMouseEnter={() =>
                      cancelDeletionCodeIconRef.current?.startAnimation()
                    }
                    onMouseLeave={() =>
                      cancelDeletionCodeIconRef.current?.stopAnimation()
                    }
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline bg-surface-container-lowest px-5 text-sm font-semibold text-on-surface transition hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XIcon
                      ref={cancelDeletionCodeIconRef}
                      aria-hidden="true"
                      animateOnHover={false}
                      size={16}
                    />
                    {t(
                      "dashboard.settings.security.dangerZone.confirm.cancel",
                      {
                        defaultValue:
                          fallbackCopy.securityDeleteAccountConfirmCancel,
                      },
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={
                      isDeleteAccountActionPending || !deleteAccountCodeIsValid
                    }
                    onClick={confirmDeleteAccount}
                    onFocus={() =>
                      deleteWithCodeIconRef.current?.startAnimation()
                    }
                    onBlur={() =>
                      deleteWithCodeIconRef.current?.stopAnimation()
                    }
                    onMouseEnter={() =>
                      deleteWithCodeIconRef.current?.startAnimation()
                    }
                    onMouseLeave={() =>
                      deleteWithCodeIconRef.current?.stopAnimation()
                    }
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-destructive px-5 text-sm font-bold text-destructive-foreground transition hover:bg-destructive/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <DeleteIcon
                      ref={deleteWithCodeIconRef}
                      aria-hidden="true"
                      animateOnHover={false}
                      size={16}
                    />
                    {isDeleteAccountActionPending
                      ? t(
                          "dashboard.settings.security.dangerZone.confirm.deleting",
                          {
                            defaultValue:
                              fallbackCopy.securityDeleteAccountDeleting,
                          },
                        )
                      : t(
                          "dashboard.settings.security.dangerZone.confirm.deleteAccount",
                          {
                            defaultValue:
                              fallbackCopy.securityDeleteAccountFinalAction,
                          },
                        )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </ViewportPortal>
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
  const searchParams = useSearchParams();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const sectionParam = searchParams.get(dashboardSettingsSectionParamName);
  const activeSectionId = isDashboardSettingsSectionId(sectionParam)
    ? sectionParam
    : "general";
  const shouldReduceMotion = useReducedMotion();
  const activeSection =
    dashboardSettingsSections.find(
      (section) => section.id === activeSectionId,
    ) ?? dashboardSettingsSections[0];
  const activeFocusSectionId = isFocusableSettingsSectionId(activeSection.id)
    ? activeSection.id
    : "general";
  const focusCardsMotion = {
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0.92 },
    animate: { opacity: 1 },
    exit: shouldReduceMotion ? { opacity: 1 } : { opacity: 0 },
    transition: shouldReduceMotion
      ? { duration: 0 }
      : { duration: 0.18, ease: "easeOut" as const },
  };
  const securityPanelMotion = {
    initial: shouldReduceMotion
      ? { opacity: 1, filter: "blur(0px) saturate(1)" }
      : { opacity: 0.92, filter: "blur(1px) saturate(0.9)" },
    animate: { opacity: 1, filter: "blur(0px) saturate(1)" },
    exit: shouldReduceMotion
      ? { opacity: 1, filter: "blur(0px) saturate(1)" }
      : { opacity: 0, filter: "blur(2px) saturate(0.72)" },
    transition: shouldReduceMotion
      ? { duration: 0 }
      : { duration: 0.18, ease: "easeOut" as const },
  };

  const pageRevealMotion = {
    initial: shouldReduceMotion
      ? { opacity: 1, filter: "blur(0px)" }
      : { opacity: 0.78, filter: "blur(1.5px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    transition: shouldReduceMotion
      ? { duration: 0 }
      : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <motion.section
      className="h-full min-h-[320px] min-w-0"
      initial={pageRevealMotion.initial}
      animate={pageRevealMotion.animate}
      transition={pageRevealMotion.transition}
    >
      <section
        id="settings-panel"
        role="region"
        aria-label={t(activeSection.labelKey, {
          defaultValue: activeSection.fallbackLabels[language],
        })}
        aria-live="polite"
        className="h-full min-h-[320px] min-w-0 text-left lg:min-h-0 lg:overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {activeSection.id === "seguridad" ? (
            <motion.div
              key="seguridad"
              className="w-full lg:h-full lg:min-h-0 lg:overflow-x-hidden lg:overflow-y-auto"
              initial={securityPanelMotion.initial}
              animate={securityPanelMotion.animate}
              exit={securityPanelMotion.exit}
              transition={securityPanelMotion.transition}
            >
              <ConfiguracionSecurityPanel
                userEmail={user.email}
                sessions={sessions}
              />
            </motion.div>
          ) : (
            <motion.div
              key="focus-cards"
              className="grid gap-5 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:justify-between lg:overflow-x-hidden lg:overflow-y-auto"
              initial={focusCardsMotion.initial}
              animate={focusCardsMotion.animate}
              exit={focusCardsMotion.exit}
              transition={focusCardsMotion.transition}
            >
              <SettingsFocusCard
                sectionId="general"
                activeSectionId={activeFocusSectionId}
                shouldReduceMotion={Boolean(shouldReduceMotion)}
              >
                <ConfiguracionGeneralPanel />
              </SettingsFocusCard>
              <SettingsFocusCard
                sectionId="perfil"
                activeSectionId={activeFocusSectionId}
                shouldReduceMotion={Boolean(shouldReduceMotion)}
              >
                <ConfiguracionProfilePanel user={user} />
              </SettingsFocusCard>
              <SettingsFocusCard
                sectionId="notificaciones"
                activeSectionId={activeFocusSectionId}
                className="pb-4 sm:pb-5"
                shouldReduceMotion={Boolean(shouldReduceMotion)}
              >
                <ConfiguracionNotificationsPanel />
              </SettingsFocusCard>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.section>
  );
}
