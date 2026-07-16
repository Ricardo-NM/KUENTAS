import { describe, expect, it } from "vitest";
import {
  dashboardCurrencyOptions,
  dashboardNotificationOptions,
  dashboardSettingsFallbackCopy,
  dashboardSettingsSectionParamName,
  dashboardSettingsSections,
  getDashboardSettingsSectionHref,
  isDashboardSettingsSectionId,
} from "./settings";

describe("dashboard settings sections", () => {
  it("defines the internal settings navigation in the requested order", () => {
    expect(dashboardSettingsSections.map((section) => section.id)).toEqual([
      "general",
      "perfil",
      "notificaciones",
      "seguridad",
    ]);

    expect(
      dashboardSettingsSections.map((section) => section.labelKey),
    ).toEqual([
      "dashboard.settings.sections.general",
      "dashboard.settings.sections.perfil",
      "dashboard.settings.sections.notificaciones",
      "dashboard.settings.sections.seguridad",
    ]);

    expect(dashboardSettingsSections.map((section) => section.icon)).toEqual([
      "cog",
      "user-round-cog",
      "bell",
      "shield-check",
    ]);
  });

  it("builds shareable settings section links", () => {
    expect(dashboardSettingsSectionParamName).toBe("seccion");
    expect(getDashboardSettingsSectionHref("general")).toBe(
      "/configuracion?seccion=general",
    );
    expect(getDashboardSettingsSectionHref("perfil")).toBe(
      "/configuracion?seccion=perfil",
    );
    expect(getDashboardSettingsSectionHref("notificaciones")).toBe(
      "/configuracion?seccion=notificaciones",
    );
    expect(getDashboardSettingsSectionHref("seguridad")).toBe(
      "/configuracion?seccion=seguridad",
    );
    expect(isDashboardSettingsSectionId("perfil")).toBe(true);
    expect(isDashboardSettingsSectionId("otra")).toBe(false);
    expect(isDashboardSettingsSectionId(null)).toBe(false);
  });

  it("keeps fallback labels in both languages for missing runtime translation resources", () => {
    expect(
      dashboardSettingsSections.map((section) => section.fallbackLabels.es),
    ).toEqual(["General", "Perfil de usuario", "Notificaciones", "Seguridad"]);

    expect(
      dashboardSettingsSections.map((section) => section.fallbackLabels.en),
    ).toEqual(["General", "User profile", "Notifications", "Security"]);

    expect(dashboardSettingsFallbackCopy.es.title).toBe("Configuración");
    expect(dashboardSettingsFallbackCopy.es.greeting).toBe(
      "Saludos desde {{section}}",
    );
    expect(dashboardSettingsFallbackCopy.en.title).toBe("Settings");
    expect(dashboardSettingsFallbackCopy.en.greeting).toBe(
      "Greetings from {{section}}",
    );
    expect(dashboardSettingsFallbackCopy.es.profileSave).toBe("Guardar");
    expect(dashboardSettingsFallbackCopy.en.profileSave).toBe("Save");
    expect(dashboardSettingsFallbackCopy.es.securityTitle).toBe(
      "Seguridad de la cuenta",
    );
    expect(dashboardSettingsFallbackCopy.es.securityCurrentPassword).toBe(
      "Contraseña actual",
    );
    expect(dashboardSettingsFallbackCopy.es.securityTwoFactorTitle).toBe(
      "Autenticación de dos pasos (2FA)",
    );
    expect(dashboardSettingsFallbackCopy.es.securityDangerAction).toBe(
      "Eliminar mi cuenta permanentemente",
    );
    expect(dashboardSettingsFallbackCopy.es.securityCloseAllSessions).toBe(
      "Cerrar todas",
    );
    expect(dashboardSettingsFallbackCopy.es.securityUnknownDevice).toBe(
      "Dispositivo desconocido",
    );
    expect(dashboardSettingsFallbackCopy.es.securityConfirmCloseAllTitle).toBe(
      "Cerrar todas las sesiones",
    );
    expect(dashboardSettingsFallbackCopy.es.securityAllSessionsClosed).toBe(
      "Todas las demás sesiones fueron cerradas.",
    );
    expect(dashboardSettingsFallbackCopy.es.notificationsTitle).toBe(
      "Ajustes de notificaciones",
    );
    expect(dashboardSettingsFallbackCopy.es.upcomingPaymentsTitle).toBe(
      "Pagos próximos",
    );
    expect(dashboardSettingsFallbackCopy.es.paymentAlertsTitle).toBe(
      "Alertas de pago",
    );
    expect(dashboardSettingsFallbackCopy.es.weeklySummaryTitle).toBe(
      "Resumen semanal",
    );
    expect(dashboardSettingsFallbackCopy.en.securityTitle).toBe(
      "Account security",
    );
    expect(dashboardSettingsFallbackCopy.en.securityCurrentPassword).toBe(
      "Current password",
    );
    expect(dashboardSettingsFallbackCopy.en.securityTwoFactorTitle).toBe(
      "Two-factor authentication (2FA)",
    );
    expect(dashboardSettingsFallbackCopy.en.securityDangerAction).toBe(
      "Delete my account permanently",
    );
    expect(dashboardSettingsFallbackCopy.en.securityCloseAllSessions).toBe(
      "Sign out all",
    );
    expect(dashboardSettingsFallbackCopy.en.securityUnknownDevice).toBe(
      "Unknown device",
    );
    expect(dashboardSettingsFallbackCopy.en.securityConfirmCloseAllTitle).toBe(
      "Sign out all sessions",
    );
    expect(dashboardSettingsFallbackCopy.en.securityAllSessionsClosed).toBe(
      "All other sessions were signed out.",
    );
    expect(dashboardSettingsFallbackCopy.en.notificationsTitle).toBe(
      "Notification settings",
    );
    expect(dashboardSettingsFallbackCopy.en.upcomingPaymentsTitle).toBe(
      "Upcoming payments",
    );
    expect(dashboardSettingsFallbackCopy.en.paymentAlertsTitle).toBe(
      "Payment alerts",
    );
    expect(dashboardSettingsFallbackCopy.en.weeklySummaryTitle).toBe(
      "Weekly summary",
    );
  });

  it("defines the general settings currency options in the requested order", () => {
    expect(dashboardCurrencyOptions).toEqual([
      {
        value: "MXN",
        labelKey: "dashboard.settings.general.currency.options.mxn",
        fallbackLabels: {
          es: "MXN ($) - Peso Mexicano",
          en: "MXN ($) - Peso Mexicano",
        },
      },
      {
        value: "USD",
        labelKey: "dashboard.settings.general.currency.options.usd",
        fallbackLabels: {
          es: "USD ($) - US Dollar",
          en: "USD ($) - US Dollar",
        },
      },
      {
        value: "EUR",
        labelKey: "dashboard.settings.general.currency.options.eur",
        fallbackLabels: {
          es: "EUR (€) - Euro",
          en: "EUR (€) - Euro",
        },
      },
    ]);
  });

  it("defines notification settings toggles with icons and initial states", () => {
    expect(dashboardNotificationOptions).toEqual([
      {
        id: "upcoming-payments",
        titleKey:
          "dashboard.settings.notifications.options.upcomingPayments.title",
        descriptionKey:
          "dashboard.settings.notifications.options.upcomingPayments.description",
        icon: "calendar-days",
        initiallyEnabled: true,
        fallbackTitles: {
          es: "Pagos próximos",
          en: "Upcoming payments",
        },
        fallbackDescriptions: {
          es: "Recibe un aviso una semana antes de tu fecha límite.",
          en: "Get a reminder one week before your due date.",
        },
      },
      {
        id: "payment-alerts",
        titleKey:
          "dashboard.settings.notifications.options.paymentAlerts.title",
        descriptionKey:
          "dashboard.settings.notifications.options.paymentAlerts.description",
        icon: "badge-alert",
        initiallyEnabled: true,
        fallbackTitles: {
          es: "Alertas de pago",
          en: "Payment alerts",
        },
        fallbackDescriptions: {
          es: "Notificar cuando existan pagos pendientes.",
          en: "Notify when there are pending payments.",
        },
      },
      {
        id: "weekly-summary",
        titleKey:
          "dashboard.settings.notifications.options.weeklySummary.title",
        descriptionKey:
          "dashboard.settings.notifications.options.weeklySummary.description",
        icon: "mailbox",
        initiallyEnabled: false,
        fallbackTitles: {
          es: "Resumen semanal",
          en: "Weekly summary",
        },
        fallbackDescriptions: {
          es: "Correo electrónico con tus estadísticas de la semana.",
          en: "Email with your weekly statistics.",
        },
      },
    ]);
  });
});
