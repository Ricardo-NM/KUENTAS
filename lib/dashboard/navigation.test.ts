import { describe, expect, it } from "vitest";
import { resources } from "@/lib/i18n/resources";
import {
  dashboardNavGroupFallbackLabels,
  dashboardNavGroups,
  dashboardNavItems,
  dashboardSections,
} from "./navigation";

describe("dashboard navigation", () => {
  it("defines the sidebar sections in the requested order", () => {
    expect(dashboardNavItems.map((item) => item.href)).toEqual([
      "/inicio",
      "/calendario",
      "/pagos",
      "/estadisticas",
      "/configuracion",
    ]);

    expect(dashboardNavItems.map((item) => item.icon)).toEqual([
      "layout-grid",
      "calendar-check",
      "hand-coins",
      "chart-pie",
      "settings",
    ]);
  });

  it("keeps navigation labels and page greetings in both languages", () => {
    for (const item of dashboardNavItems) {
      expect(resources.es.translation.dashboard.navigation[item.section]).toBe(
        dashboardSections[item.section].es,
      );
      expect(resources.en.translation.dashboard.navigation[item.section]).toBe(
        dashboardSections[item.section].en,
      );
    }

    expect(resources.es.translation.dashboard.greeting).toBe(
      "Saludos desde {{section}}",
    );
    expect(resources.en.translation.dashboard.greeting).toBe(
      "Greetings from {{section}}",
    );
  });

  it("groups sidebar sections into menu and account", () => {
    expect(dashboardNavGroups).toEqual([
      {
        id: "menu",
        sections: ["inicio", "calendario", "pagos", "estadisticas"],
      },
      {
        id: "account",
        sections: ["configuracion"],
      },
    ]);

    expect(resources.es.translation.dashboard.groups.menu).toBe("MENU");
    expect(resources.es.translation.dashboard.groups.account).toBe("CUENTA");
    expect(resources.en.translation.dashboard.groups.menu).toBe("MENU");
    expect(resources.en.translation.dashboard.groups.account).toBe("ACCOUNT");
    expect(dashboardNavGroupFallbackLabels).toEqual({
      menu: {
        es: "MENU",
        en: "MENU",
      },
      account: {
        es: "CUENTA",
        en: "ACCOUNT",
      },
    });
  });
});
