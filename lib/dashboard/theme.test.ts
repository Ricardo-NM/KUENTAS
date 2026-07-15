import { describe, expect, it } from "vitest";
import {
  dashboardActiveIndicatorSweepStates,
  dashboardActiveIndicatorSweepTransition,
  dashboardCanvasColor,
  dashboardSettingsPanelColor,
  dashboardSurfaceColor,
} from "./theme";

describe("dashboard theme", () => {
  it("uses a white dashboard canvas with soft internal settings panels", () => {
    expect(dashboardSurfaceColor).toBe("#f7f9fb");
    expect(dashboardCanvasColor).toBe("#ffffff");
    expect(dashboardSettingsPanelColor).toBe("#f7f9fb");
    expect(dashboardSettingsPanelColor).not.toBe(dashboardCanvasColor);
  });

  it("defines a perceptible sweep transition for active sidebar item changes", () => {
    expect(dashboardActiveIndicatorSweepTransition).toEqual({
      duration: 0.26,
      ease: "easeOut",
    });
  });

  it("uses clipping states for the active sidebar sweep to avoid collapsed transform artifacts", () => {
    expect(dashboardActiveIndicatorSweepStates).toEqual({
      initial: { clipPath: "inset(0 100% 0 0 round 0.5rem)" },
      animate: { clipPath: "inset(0 0% 0 0 round 0.5rem)" },
      exit: { clipPath: "inset(0 100% 0 0 round 0.5rem)" },
    });
  });
});
