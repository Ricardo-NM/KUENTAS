export const dashboardSurfaceColor = "#f7f9fb";
export const dashboardCanvasColor = "#ffffff";
export const dashboardSettingsPanelColor = "#f7f9fb";
export const dashboardActiveIndicatorSweepTransition = {
  duration: 0.26,
  ease: "easeOut",
} as const;

export const dashboardActiveIndicatorSweepStates = {
  initial: { opacity: 0, scaleX: 0 },
  animate: { opacity: 1, scaleX: 1 },
  exit: { opacity: 0, scaleX: 0 },
} as const;
