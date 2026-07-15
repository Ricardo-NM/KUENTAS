export const dashboardSurfaceColor = "#f7f9fb";
export const dashboardCanvasColor = "#ffffff";
export const dashboardSettingsPanelColor = "#f7f9fb";
export const dashboardActiveIndicatorSweepTransition = {
  duration: 0.26,
  ease: "easeOut",
} as const;

export const dashboardActiveIndicatorSweepStates = {
  initial: { clipPath: "inset(0 100% 0 0 round 0.5rem)" },
  animate: { clipPath: "inset(0 0% 0 0 round 0.5rem)" },
  exit: { clipPath: "inset(0 100% 0 0 round 0.5rem)" },
} as const;
