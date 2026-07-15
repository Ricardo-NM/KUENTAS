"use client";

import { LanguagesIcon, type LanguagesIconHandle } from "lucide-animated";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SupportedLanguage } from "@/lib/i18n/resources";

type LanguageOption = {
  language: SupportedLanguage;
  labelKey: "language.spanish" | "language.english";
};

export function getLanguageOptions(): LanguageOption[] {
  return [
    { language: "es", labelKey: "language.spanish" },
    { language: "en", labelKey: "language.english" },
  ];
}

export const languageSwitcherButtonContentOrder = ["icon", "label"] as const;
export const languageSwitcherIconAnimationArea = "button";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef<LanguagesIconHandle>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const openMenu = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    setIsOpen(true);
  };

  const startButtonIconAnimation = () => {
    openMenu();
    iconRef.current?.startAnimation();
  };

  const stopButtonIconAnimation = () => {
    iconRef.current?.stopAnimation();
  };

  const scheduleClose = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      iconRef.current?.stopAnimation();
    }, 120);
  };

  const changeLanguage = (language: SupportedLanguage) => {
    i18n.changeLanguage(language);
    setIsOpen(false);
    iconRef.current?.stopAnimation();
  };

  return (
    <div
      className="login-reveal login-delay-5 fixed bottom-4 right-4 z-20 sm:bottom-8 sm:right-8"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onFocus={openMenu}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          scheduleClose();
        }
      }}
    >
      <div
        role="menu"
        aria-label={t("language.menuLabel")}
        className={`absolute bottom-full right-0 mb-3 w-40 origin-bottom-right rounded-lg border border-[#d7e7ff]/70 bg-[#eff6ff] p-1.5 text-[#0b1c30] shadow-[0_18px_48px_rgb(0_0_0/0.28)] transition duration-200 ease-out ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-95 opacity-0"
        }`}
      >
        {getLanguageOptions().map((option) => {
          const isSelected = i18n.language === option.language;

          return (
            <button
              key={option.language}
              type="button"
              role="menuitemradio"
              aria-checked={isSelected}
              onClick={() => changeLanguage(option.language)}
              className={`flex min-h-11 w-full cursor-pointer items-center justify-between rounded-md px-3 text-left text-sm font-semibold transition hover:bg-[#d0e1fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b1c30] ${
                isSelected ? "bg-white text-[#0b1c30]" : "text-[#19304d]"
              }`}
            >
              <span>{t(option.labelKey)}</span>
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${
                  isSelected ? "bg-[#0b1c30]" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={t("language.aria")}
        onClick={() => {
          if (isOpen) {
            scheduleClose();
          } else {
            openMenu();
          }
        }}
        onMouseEnter={startButtonIconAnimation}
        onMouseLeave={stopButtonIconAnimation}
        onFocus={startButtonIconAnimation}
        onBlur={stopButtonIconAnimation}
        className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border border-[#d7e7ff]/70 bg-[#eff6ff] px-4 text-sm font-bold text-[#0b1c30] shadow-[0_16px_48px_rgb(0_0_0/0.24)] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb]"
      >
        <LanguagesIcon ref={iconRef} aria-hidden="true" size={20} />
        <span>{t("language.button")}</span>
      </button>
    </div>
  );
}
