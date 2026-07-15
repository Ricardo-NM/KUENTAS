export const dashboardSections = {
  inicio: {
    es: "Inicio",
    en: "Home",
  },
  calendario: {
    es: "Calendario",
    en: "Calendar",
  },
  pagos: {
    es: "Pagos",
    en: "Payments",
  },
  estadisticas: {
    es: "Estadísticas",
    en: "Statistics",
  },
  configuracion: {
    es: "Configuración",
    en: "Settings",
  },
} as const;

export type DashboardSection = keyof typeof dashboardSections;
export type DashboardNavGroup = "menu" | "account";

export const dashboardNavGroupFallbackLabels: Record<
  DashboardNavGroup,
  {
    es: string;
    en: string;
  }
> = {
  menu: {
    es: "MENU",
    en: "MENU",
  },
  account: {
    es: "CUENTA",
    en: "ACCOUNT",
  },
};

export const dashboardNavItems: {
  section: DashboardSection;
  href: `/${string}`;
  icon:
    | "layout-grid"
    | "calendar-check"
    | "hand-coins"
    | "chart-pie"
    | "settings";
}[] = [
  {
    section: "inicio",
    href: "/inicio",
    icon: "layout-grid",
  },
  {
    section: "calendario",
    href: "/calendario",
    icon: "calendar-check",
  },
  {
    section: "pagos",
    href: "/pagos",
    icon: "hand-coins",
  },
  {
    section: "estadisticas",
    href: "/estadisticas",
    icon: "chart-pie",
  },
  {
    section: "configuracion",
    href: "/configuracion",
    icon: "settings",
  },
];

export const dashboardNavGroups: {
  id: DashboardNavGroup;
  sections: DashboardSection[];
}[] = [
  {
    id: "menu",
    sections: ["inicio", "calendario", "pagos", "estadisticas"],
  },
  {
    id: "account",
    sections: ["configuracion"],
  },
];
