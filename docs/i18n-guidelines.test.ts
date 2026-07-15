import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("i18n guidelines", () => {
  it("documents the global language contract for current and future routes", () => {
    const guidelines = readFileSync("docs/i18n-guidelines.md", "utf8");

    expect(guidelines).toContain("El cambio de idioma es global");
    expect(guidelines).toContain("todas las rutas actuales y futuras");
    expect(guidelines).toContain("public/locales/es.json");
    expect(guidelines).toContain("public/locales/en.json");
    expect(guidelines).toContain("solo debe mostrarse en /login, /registro y /recuperacion");
  });
});
