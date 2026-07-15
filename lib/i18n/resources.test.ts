import { describe, expect, it } from "vitest";
import {
  defaultLanguage,
  getInitialLanguage,
  resources,
  supportedLanguages,
} from "./resources";

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("i18n resources", () => {
  it("uses Spanish as the default language", () => {
    expect(defaultLanguage).toBe("es");
    expect(supportedLanguages).toEqual(["es", "en"]);
  });

  it("keeps English and Spanish translation keys in sync", () => {
    expect(flattenKeys(resources.en.translation).sort()).toEqual(
      flattenKeys(resources.es.translation).sort(),
    );
  });

  it("reads only supported persisted languages", () => {
    const englishStorage: Pick<Storage, "getItem"> = {
      getItem: () => "en",
    };
    const invalidStorage: Pick<Storage, "getItem"> = {
      getItem: () => "fr",
    };

    expect(getInitialLanguage(englishStorage)).toBe("en");
    expect(getInitialLanguage(invalidStorage)).toBe("es");
  });

  it("includes route copy for the current non-auth routes", () => {
    expect(resources.es.translation.home.systemLabel).toBe(
      "Sistema de cuentas",
    );
    expect(resources.en.translation.home.systemLabel).toBe("Accounts system");
    expect(resources.es.translation.inicio.title).toBe("Aquí ira el inicio");
    expect(resources.en.translation.inicio.title).toBe(
      "This is where home goes",
    );
  });

  it("includes dashboard settings copy in both supported languages", () => {
    expect(resources.es.translation.dashboard.settings.title).toBe(
      "Configuración",
    );
    expect(resources.es.translation.dashboard.settings.description).toBe(
      "Administra tu perfil, preferencias y seguridad de la cuenta.",
    );
    expect(resources.es.translation.dashboard.settings.sections.perfil).toBe(
      "Perfil de usuario",
    );
    expect(resources.es.translation.dashboard.settings.greeting).toBe(
      "Saludos desde {{section}}",
    );
    expect(resources.es.translation.dashboard.settings.general.title).toBe(
      "Configuración general",
    );
    expect(
      resources.es.translation.dashboard.settings.general.interfaceLanguage
        .label,
    ).toBe("Idioma de la interfaz");
    expect(
      resources.es.translation.dashboard.settings.general.currency.label,
    ).toBe("Moneda principal");
    expect(
      resources.es.translation.dashboard.settings.general.currency.options,
    ).toEqual({
      mxn: "MXN ($) - Peso Mexicano",
      usd: "USD ($) - US Dollar",
      eur: "EUR (€) - Euro",
    });
    expect(
      resources.es.translation.dashboard.settings.general.theme.label,
    ).toBe("Tema visual");

    expect(resources.en.translation.dashboard.settings.title).toBe("Settings");
    expect(resources.en.translation.dashboard.settings.description).toBe(
      "Manage your profile, preferences, and account security.",
    );
    expect(resources.en.translation.dashboard.settings.sections.perfil).toBe(
      "User profile",
    );
    expect(resources.en.translation.dashboard.settings.greeting).toBe(
      "Greetings from {{section}}",
    );
    expect(resources.en.translation.dashboard.settings.general.title).toBe(
      "General settings",
    );
    expect(
      resources.en.translation.dashboard.settings.general.interfaceLanguage
        .label,
    ).toBe("Interface language");
    expect(
      resources.en.translation.dashboard.settings.general.currency.label,
    ).toBe("Primary currency");
    expect(
      resources.en.translation.dashboard.settings.general.currency.options,
    ).toEqual({
      mxn: "MXN ($) - Peso Mexicano",
      usd: "USD ($) - US Dollar",
      eur: "EUR (€) - Euro",
    });
    expect(
      resources.en.translation.dashboard.settings.general.theme.label,
    ).toBe("Visual theme");
  });
});
