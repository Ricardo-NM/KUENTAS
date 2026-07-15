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
});
