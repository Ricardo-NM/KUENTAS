export type DashboardTheme = "light" | "dark";

export const dashboardThemeStorageKey = "kuentas:dashboard-theme";

type ThemeClassList = {
  add: (className: string) => void;
  remove: (className: string) => void;
};

type ThemeStorage = {
  setItem: (key: string, value: string) => void;
};

export function resolveDashboardTheme(
  value: string | null | undefined,
): DashboardTheme {
  return value === "dark" ? "dark" : "light";
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
