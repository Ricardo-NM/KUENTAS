export type DashboardTheme = "light" | "dark";

export const dashboardThemeStorageKey = "kuentas:dashboard-theme";

type ThemeClassList = {
  add: (className: string) => void;
  remove: (className: string) => void;
};

type ThemeStorage = {
  setItem: (key: string, value: string) => void;
};

type ReadableThemeStorage = {
  getItem: (key: string) => string | null;
};

type ThemeViewTransition = {
  finished?: Promise<unknown>;
  ready: Promise<unknown>;
};

type ThemeTransitionAnimationOptions = KeyframeAnimationOptions & {
  pseudoElement: string;
};

type ThemeTransitionDocument = {
  defaultView?: {
    innerHeight: number;
    innerWidth: number;
    matchMedia?: (query: string) => { matches: boolean };
  } | null;
  documentElement?: {
    animate?: (
      keyframes: PropertyIndexedKeyframes,
      options: ThemeTransitionAnimationOptions,
    ) => unknown;
    classList: ThemeClassList;
  };
  startViewTransition?: (update: () => void) => ThemeViewTransition;
};

type ThemeTransitionOrigin = {
  clientX: number;
  clientY: number;
};

export function resolveDashboardTheme(
  value: string | null | undefined,
): DashboardTheme {
  return value === "dark" ? "dark" : "light";
}

export function readDashboardThemePreference(
  storage: ReadableThemeStorage | undefined = globalThis.localStorage,
): DashboardTheme {
  try {
    return resolveDashboardTheme(storage?.getItem(dashboardThemeStorageKey));
  } catch {
    return "light";
  }
}

export function applyDashboardTheme(
  theme: DashboardTheme,
  target: {
    classList?: ThemeClassList;
    storage?: ThemeStorage;
  } = {},
): void {
  const classList = target.classList ?? globalThis.document?.documentElement.classList;
  const storage = target.storage ?? globalThis.localStorage;

  if (theme === "dark") {
    classList?.add("dark");
  } else {
    classList?.remove("dark");
  }

  try {
    storage?.setItem(dashboardThemeStorageKey, theme);
  } catch {
    // Storage may be unavailable in private browsing or restricted contexts.
  }
}

export function getDashboardThemeInitScript(): string {
  return `(function(){try{var t=localStorage.getItem("${dashboardThemeStorageKey}");if(t==="dark"){document.documentElement.classList.add("dark")}else{document.documentElement.classList.remove("dark")}}catch(e){}})()`;
}

export function startDashboardThemeViewTransition({
  origin,
  target = globalThis.document,
  update,
}: {
  origin?: ThemeTransitionOrigin;
  target?: ThemeTransitionDocument;
  update: () => void;
}): boolean {
  const root = target.documentElement;
  const view = target.defaultView ?? globalThis.window;
  const prefersReducedMotion = view
    ?.matchMedia?.("(prefers-reduced-motion: reduce)")
    .matches;

  if (
    prefersReducedMotion ||
    !target.startViewTransition ||
    !root?.animate
  ) {
    update();
    return false;
  }

  const width = view?.innerWidth ?? 0;
  const height = view?.innerHeight ?? 0;
  const x = origin?.clientX ?? width / 2;
  const y = origin?.clientY ?? height / 2;
  const endRadius = Math.ceil(
    Math.hypot(Math.max(x, width - x), Math.max(y, height - y)),
  );

  root.classList.add("theme-view-transition");

  const transition = target.startViewTransition(update);

  void transition.ready
    .then(() => {
      root.animate?.(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 520,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => undefined);

  void (transition.finished ?? transition.ready).finally(() => {
    root.classList.remove("theme-view-transition");
  });

  return true;
}
