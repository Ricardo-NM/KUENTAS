import { describe, expect, it } from "vitest";
import {
  dashboardActiveIndicatorSweepStates,
  dashboardActiveIndicatorSweepTransition,
  dashboardCanvasColor,
  dashboardSurfaceColor,
} from "./theme";

describe("dashboard theme", () => {
  it("uses a darker canvas behind the sidebar and message cards", () => {
    expect(dashboardSurfaceColor).toBe("#f7f9fb");
    expect(dashboardCanvasColor).toBe("#eceef0");
    expect(dashboardCanvasColor).not.toBe(dashboardSurfaceColor);
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
