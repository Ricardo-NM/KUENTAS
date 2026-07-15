import { describe, expect, it, vi } from "vitest";
import {
  applyDashboardTheme,
  dashboardThemeStorageKey,
  getDashboardThemeInitScript,
  resolveDashboardTheme,
} from "./theme-preference";

describe("dashboard theme preference", () => {
  it("defaults unsupported or missing theme values to light", () => {
    expect(resolveDashboardTheme(null)).toBe("light");
    expect(resolveDashboardTheme(undefined)).toBe("light");
    expect(resolveDashboardTheme("system")).toBe("light");
    expect(resolveDashboardTheme("dark")).toBe("dark");
    expect(resolveDashboardTheme("light")).toBe("light");
  });

  it("applies the dark class and persists the selected dashboard theme", () => {
    const add = vi.fn();
    const remove = vi.fn();
    const setItem = vi.fn();

    applyDashboardTheme("dark", {
      classList: { add, remove },
      storage: { setItem },
    });

    expect(add).toHaveBeenCalledWith("dark");
    expect(remove).not.toHaveBeenCalled();
    expect(setItem).toHaveBeenCalledWith(dashboardThemeStorageKey, "dark");
  });

  it("removes the dark class when light is selected", () => {
    const add = vi.fn();
    const remove = vi.fn();
    const setItem = vi.fn();

    applyDashboardTheme("light", {
      classList: { add, remove },
      storage: { setItem },
    });

    expect(remove).toHaveBeenCalledWith("dark");
    expect(add).not.toHaveBeenCalled();
    expect(setItem).toHaveBeenCalledWith(dashboardThemeStorageKey, "light");
  });

  it("generates a synchronous init script that reads the dashboard theme key", () => {
    const script = getDashboardThemeInitScript();

    expect(script).toContain(dashboardThemeStorageKey);
    expect(script).toContain("document.documentElement.classList.add(\"dark\")");
    expect(script).toContain("document.documentElement.classList.remove(\"dark\")");
  });
});
