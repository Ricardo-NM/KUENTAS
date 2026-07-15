export const dashboardSettingsSections = [
  {
    id: "general",
    labelKey: "dashboard.settings.sections.general",
    fallbackLabels: {
      es: "General",
      en: "General",
    },
    icon: "cog",
  },
  {
    id: "perfil",
    labelKey: "dashboard.settings.sections.perfil",
    fallbackLabels: {
      es: "Perfil de usuario",
      en: "User profile",
    },
    icon: "user-round-cog",
  },
  {
    id: "notificaciones",
    labelKey: "dashboard.settings.sections.notificaciones",
    fallbackLabels: {
      es: "Notificaciones",
      en: "Notifications",
    },
    icon: "bell",
  },
  {
    id: "seguridad",
    labelKey: "dashboard.settings.sections.seguridad",
    fallbackLabels: {
      es: "Seguridad",
      en: "Security",
    },
    icon: "shield-check",
  },
] as const;

export const dashboardSettingsFallbackCopy = {
  es: {
    title: "Configuración",
    description: "Administra tu perfil, preferencias y seguridad de la cuenta.",
    navigationLabel: "Secciones de configuración",
    greeting: "Saludos desde {{section}}",
    generalTitle: "Configuración general",
    interfaceLanguageLabel: "Idioma de la interfaz",
    currencyLabel: "Moneda principal",
    visualThemeLabel: "Tema visual",
    lightTheme: "Claro",
    darkTheme: "Oscuro",
  },
  en: {
    title: "Settings",
    description: "Manage your profile, preferences, and account security.",
    navigationLabel: "Settings sections",
    greeting: "Greetings from {{section}}",
    generalTitle: "General settings",
    interfaceLanguageLabel: "Interface language",
    currencyLabel: "Primary currency",
    visualThemeLabel: "Visual theme",
    lightTheme: "Light",
    darkTheme: "Dark",
  },
} as const;

export const dashboardCurrencyOptions = [
  {
    value: "MXN",
    labelKey: "dashboard.settings.general.currency.options.mxn",
    fallbackLabels: {
      es: "MXN ($) - Peso Mexicano",
      en: "MXN ($) - Peso Mexicano",
    },
  },
  {
    value: "USD",
    labelKey: "dashboard.settings.general.currency.options.usd",
    fallbackLabels: {
      es: "USD ($) - US Dollar",
      en: "USD ($) - US Dollar",
    },
  },
  {
    value: "EUR",
    labelKey: "dashboard.settings.general.currency.options.eur",
    fallbackLabels: {
      es: "EUR (€) - Euro",
      en: "EUR (€) - Euro",
    },
  },
] as const;

export type DashboardSettingsSection =
  (typeof dashboardSettingsSections)[number];
export type DashboardSettingsSectionId = DashboardSettingsSection["id"];
export type DashboardSettingsIcon = DashboardSettingsSection["icon"];
