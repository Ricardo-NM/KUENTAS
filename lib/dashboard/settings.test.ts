import { describe, expect, it } from "vitest";
import {
  dashboardCurrencyOptions,
  dashboardSettingsFallbackCopy,
  dashboardSettingsSections,
} from "./settings";

describe("dashboard settings sections", () => {
  it("defines the internal settings navigation in the requested order", () => {
    expect(dashboardSettingsSections.map((section) => section.id)).toEqual([
      "general",
      "perfil",
      "notificaciones",
      "seguridad",
    ]);

    expect(
      dashboardSettingsSections.map((section) => section.labelKey),
    ).toEqual([
      "dashboard.settings.sections.general",
      "dashboard.settings.sections.perfil",
      "dashboard.settings.sections.notificaciones",
      "dashboard.settings.sections.seguridad",
    ]);

    expect(dashboardSettingsSections.map((section) => section.icon)).toEqual([
      "cog",
      "user-round-cog",
      "bell",
      "shield-check",
    ]);
  });

  it("keeps fallback labels in both languages for missing runtime translation resources", () => {
    expect(
      dashboardSettingsSections.map((section) => section.fallbackLabels.es),
    ).toEqual(["General", "Perfil de usuario", "Notificaciones", "Seguridad"]);

    expect(
      dashboardSettingsSections.map((section) => section.fallbackLabels.en),
    ).toEqual(["General", "User profile", "Notifications", "Security"]);

    expect(dashboardSettingsFallbackCopy.es.title).toBe("Configuración");
    expect(dashboardSettingsFallbackCopy.es.greeting).toBe(
      "Saludos desde {{section}}",
    );
    expect(dashboardSettingsFallbackCopy.en.title).toBe("Settings");
    expect(dashboardSettingsFallbackCopy.en.greeting).toBe(
      "Greetings from {{section}}",
    );
  });

  it("defines the general settings currency options in the requested order", () => {
    expect(dashboardCurrencyOptions).toEqual([
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
    ]);
  });
});
