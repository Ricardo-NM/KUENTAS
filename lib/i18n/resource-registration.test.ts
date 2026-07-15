import { createInstance } from "i18next";
import { describe, expect, it } from "vitest";
import { applyTranslationResources } from "./resources";

describe("translation resource registration", () => {
  it("refreshes nested resources on an already initialized i18n instance", async () => {
    const instance = createInstance();

    await instance.init({
      lng: "es",
      fallbackLng: "es",
      resources: {
        es: {
          translation: {
            common: {
              appName: "KUENTAS",
            },
          },
        },
      },
      interpolation: {
        escapeValue: false,
      },
    });

    expect(instance.t("dashboard.navigation.inicio")).toBe(
      "dashboard.navigation.inicio",
    );

    applyTranslationResources(instance);

    expect(instance.t("dashboard.navigation.inicio")).toBe("Inicio");
    expect(instance.t("dashboard.logout")).toBe("Cerrar sesión");
  });
});
