import { describe, expect, it, vi } from "vitest";
import {
  applyDashboardTheme,
  dashboardThemeStorageKey,
  getDashboardThemeInitScript,
  readDashboardThemePreference,
  resolveDashboardTheme,
  startDashboardThemeViewTransition,
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

  it("reads a stored dashboard theme without throwing when storage is unavailable", () => {
    expect(
      readDashboardThemePreference({
        getItem: () => "dark",
      }),
    ).toBe("dark");
    expect(
      readDashboardThemePreference({
        getItem: () => {
          throw new Error("blocked");
        },
      }),
    ).toBe("light");
  });

  it("generates a synchronous init script that reads the dashboard theme key", () => {
    const script = getDashboardThemeInitScript();

    expect(script).toContain(dashboardThemeStorageKey);
    expect(script).toContain("document.documentElement.classList.add(\"dark\")");
    expect(script).toContain("document.documentElement.classList.remove(\"dark\")");
  });

  it("falls back to an immediate update when View Transitions are unavailable", () => {
    const update = vi.fn();

    expect(
      startDashboardThemeViewTransition({
        update,
        target: {
          documentElement: {
            animate: vi.fn(),
            classList: { add: vi.fn(), remove: vi.fn() },
          },
          defaultView: {
            innerHeight: 800,
            innerWidth: 1200,
            matchMedia: () => ({ matches: false }),
          },
        },
      }),
    ).toBe(false);
    expect(update).toHaveBeenCalledOnce();
  });

  it("skips the animated sweep when reduced motion is requested", () => {
    const update = vi.fn();
    const startViewTransition = vi.fn();

    expect(
      startDashboardThemeViewTransition({
        update,
        target: {
          startViewTransition,
          documentElement: {
            animate: vi.fn(),
            classList: { add: vi.fn(), remove: vi.fn() },
          },
          defaultView: {
            innerHeight: 800,
            innerWidth: 1200,
            matchMedia: () => ({ matches: true }),
          },
        },
      }),
    ).toBe(false);
    expect(update).toHaveBeenCalledOnce();
    expect(startViewTransition).not.toHaveBeenCalled();
  });

  it("starts a circular sweep from the interaction origin when supported", async () => {
    const update = vi.fn();
    const animate = vi.fn();
    const add = vi.fn();
    const remove = vi.fn();
    const startViewTransition = vi.fn((callback: () => void) => {
      callback();

      return {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
      };
    });

    expect(
      startDashboardThemeViewTransition({
        origin: { clientX: 100, clientY: 150 },
        update,
        target: {
          startViewTransition,
          documentElement: {
            animate,
            classList: { add, remove },
          },
          defaultView: {
            innerHeight: 600,
            innerWidth: 800,
            matchMedia: () => ({ matches: false }),
          },
        },
      }),
    ).toBe(true);

    await Promise.resolve();

    expect(update).toHaveBeenCalledOnce();
    expect(add).toHaveBeenCalledWith("theme-view-transition");
    expect(animate).toHaveBeenCalledWith(
      {
        clipPath: [
          "circle(0px at 100px 150px)",
          "circle(833px at 100px 150px)",
        ],
      },
      {
        duration: 520,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );

    await Promise.resolve();
    expect(remove).toHaveBeenCalledWith("theme-view-transition");
  });
});
