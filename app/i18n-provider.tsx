"use client";

import i18n from "i18next";
import { initReactI18next, I18nextProvider } from "react-i18next";
import { useEffect, useState } from "react";
import {
  defaultLanguage,
  getInitialLanguage,
  applyTranslationResources,
  languageStorageKey,
  persistLanguage,
  resources,
  type SupportedLanguage,
} from "@/lib/i18n/resources";

function setupI18n() {
  if (i18n.isInitialized) {
    applyTranslationResources(i18n);
    return i18n;
  }

  i18n.use(initReactI18next).init({
    resources,
    lng:
      typeof window === "undefined"
        ? defaultLanguage
        : getInitialLanguage(window.localStorage),
    fallbackLng: defaultLanguage,
    interpolation: {
      escapeValue: false,
    },
  });

  applyTranslationResources(i18n);

  return i18n;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [instance] = useState(setupI18n);

  useEffect(() => {
    document.documentElement.lang = instance.language || defaultLanguage;

    const handleLanguageChange = (language: string) => {
      document.documentElement.lang = language;
      persistLanguage(language as SupportedLanguage, window.localStorage);
    };

    instance.on("languageChanged", handleLanguageChange);

    return () => {
      instance.off("languageChanged", handleLanguageChange);
    };
  }, [instance]);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(languageStorageKey);

    if (storedLanguage && storedLanguage !== instance.language) {
      instance.changeLanguage(storedLanguage);
    }
  }, [instance]);

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
