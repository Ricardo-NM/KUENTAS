import en from "@/public/locales/en.json";
import es from "@/public/locales/es.json";

export const defaultLanguage = "es";
export const supportedLanguages = ["es", "en"] as const;
export const languageStorageKey = "kuentas-language";

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const resources = {
  es: {
    translation: es,
  },
  en: {
    translation: en,
  },
} as const;

export function isSupportedLanguage(
  language: string | null,
): language is SupportedLanguage {
  return supportedLanguages.some((supported) => supported === language);
}

export function getInitialLanguage(storage?: Pick<Storage, "getItem">) {
  const persistedLanguage = storage?.getItem(languageStorageKey) ?? null;

  return isSupportedLanguage(persistedLanguage)
    ? persistedLanguage
    : defaultLanguage;
}

export function persistLanguage(
  language: SupportedLanguage,
  storage?: Pick<Storage, "setItem">,
) {
  storage?.setItem(languageStorageKey, language);
}
