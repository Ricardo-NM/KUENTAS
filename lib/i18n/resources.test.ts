import { describe, expect, it } from "vitest";
import {
  defaultLanguage,
  getInitialLanguage,
  resources,
  supportedLanguages,
} from "./resources";

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("i18n resources", () => {
  it("uses Spanish as the default language", () => {
    expect(defaultLanguage).toBe("es");
    expect(supportedLanguages).toEqual(["es", "en"]);
  });

  it("keeps English and Spanish translation keys in sync", () => {
    expect(flattenKeys(resources.en.translation).sort()).toEqual(
      flattenKeys(resources.es.translation).sort(),
    );
  });

  it("reads only supported persisted languages", () => {
    const englishStorage: Pick<Storage, "getItem"> = {
      getItem: () => "en",
    };
    const invalidStorage: Pick<Storage, "getItem"> = {
      getItem: () => "fr",
    };

    expect(getInitialLanguage(englishStorage)).toBe("en");
    expect(getInitialLanguage(invalidStorage)).toBe("es");
  });

  it("includes route copy for the current non-auth routes", () => {
    expect(resources.es.translation.home.systemLabel).toBe(
      "Sistema de cuentas",
    );
    expect(resources.en.translation.home.systemLabel).toBe("Accounts system");
    expect(resources.es.translation.inicio.title).toBe("Aquí ira el inicio");
    expect(resources.en.translation.inicio.title).toBe(
      "This is where home goes",
    );
  });

  it("includes dashboard settings copy in both supported languages", () => {
    expect(resources.es.translation.dashboard.settings.title).toBe(
      "Configuración",
    );
    expect(resources.es.translation.dashboard.settings.description).toBe(
      "Administra tu perfil, preferencias y seguridad de la cuenta.",
    );
    expect(resources.es.translation.dashboard.settings.sections.perfil).toBe(
      "Perfil de usuario",
    );
    expect(resources.es.translation.dashboard.settings.greeting).toBe(
      "Saludos desde {{section}}",
    );
    expect(resources.es.translation.dashboard.settings.general.title).toBe(
      "Configuración general",
    );
    expect(
      resources.es.translation.dashboard.settings.general.interfaceLanguage
        .label,
    ).toBe("Idioma de la interfaz");
    expect(
      resources.es.translation.dashboard.settings.general.currency.label,
    ).toBe("Moneda principal");
    expect(
      resources.es.translation.dashboard.settings.general.currency.options,
    ).toEqual({
      mxn: "MXN ($) - Peso Mexicano",
      usd: "USD ($) - US Dollar",
      eur: "EUR (€) - Euro",
    });
    expect(
      resources.es.translation.dashboard.settings.general.theme.label,
    ).toBe("Tema visual");

    expect(resources.en.translation.dashboard.settings.title).toBe("Settings");
    expect(resources.en.translation.dashboard.settings.description).toBe(
      "Manage your profile, preferences, and account security.",
    );
    expect(resources.en.translation.dashboard.settings.sections.perfil).toBe(
      "User profile",
    );
    expect(resources.en.translation.dashboard.settings.greeting).toBe(
      "Greetings from {{section}}",
    );
    expect(resources.en.translation.dashboard.settings.general.title).toBe(
      "General settings",
    );
    expect(
      resources.en.translation.dashboard.settings.general.interfaceLanguage
        .label,
    ).toBe("Interface language");
    expect(
      resources.en.translation.dashboard.settings.general.currency.label,
    ).toBe("Primary currency");
    expect(
      resources.en.translation.dashboard.settings.general.currency.options,
    ).toEqual({
      mxn: "MXN ($) - Peso Mexicano",
      usd: "USD ($) - US Dollar",
      eur: "EUR (€) - Euro",
    });
    expect(
      resources.en.translation.dashboard.settings.general.theme.label,
    ).toBe("Visual theme");

    expect(resources.es.translation.dashboard.settings.security.title).toBe(
      "Seguridad de la cuenta",
    );
    expect(
      resources.es.translation.dashboard.settings.security.password.fields
        .current,
    ).toBe("Contraseña actual");
    expect(
      resources.es.translation.dashboard.settings.security.twoFactor.title,
    ).toBe("Autenticación de dos pasos (2FA)");
    expect(
      resources.es.translation.dashboard.settings.security.recentActivity
        .title,
    ).toBe("Actividad reciente");
    expect(
      resources.es.translation.dashboard.settings.security.recentActivity
        .closeAll,
    ).toBe("Cerrar todas");
    expect(
      resources.es.translation.dashboard.settings.security.recentActivity
        .unknownDevice,
    ).toBe("Dispositivo desconocido");
    expect(
      resources.es.translation.dashboard.settings.security.recentActivity
        .confirm.closeAllTitle,
    ).toBe("Cerrar todas las sesiones");
    expect(
      resources.es.translation.dashboard.settings.security.recentActivity
        .confirm.confirm,
    ).toBe("Cerrar sesión");
    expect(
      resources.es.translation.dashboard.settings.security.recentActivity
        .feedback.closedAll,
    ).toBe("Todas las demás sesiones fueron cerradas.");
    expect(
      resources.es.translation.dashboard.settings.security.dangerZone.action,
    ).toBe("Eliminar mi cuenta permanentemente");
    expect(
      resources.es.translation.dashboard.settings.security.dangerZone.confirm,
    ).toEqual({
      title: "Eliminar cuenta",
      body: "¿Estas seguro de eliminar tu cuenta permanentemente? Esta acción no se puede revertir.",
      cancel: "Cancelar",
      confirm: "Confirmar",
    });
    expect(resources.es.translation.dashboard.settings.notifications.title).toBe(
      "Ajustes de notificaciones",
    );
    expect(
      resources.es.translation.dashboard.settings.notifications.options
        .upcomingPayments,
    ).toEqual({
      title: "Pagos próximos",
      description: "Recibe un aviso una semana antes de tu fecha límite.",
    });
    expect(
      resources.es.translation.dashboard.settings.notifications.options
        .paymentAlerts,
    ).toEqual({
      title: "Alertas de pago",
      description: "Notificar cuando existan pagos pendientes.",
    });
    expect(
      resources.es.translation.dashboard.settings.notifications.options
        .weeklySummary,
    ).toEqual({
      title: "Resumen semanal",
      description: "Correo electrónico con tus estadísticas de la semana.",
    });

    expect(resources.en.translation.dashboard.settings.security.title).toBe(
      "Account security",
    );
    expect(
      resources.en.translation.dashboard.settings.security.password.fields
        .current,
    ).toBe("Current password");
    expect(
      resources.en.translation.dashboard.settings.security.twoFactor.title,
    ).toBe("Two-factor authentication (2FA)");
    expect(
      resources.en.translation.dashboard.settings.security.recentActivity.title,
    ).toBe("Recent activity");
    expect(
      resources.en.translation.dashboard.settings.security.recentActivity
        .closeAll,
    ).toBe("Sign out all");
    expect(
      resources.en.translation.dashboard.settings.security.recentActivity
        .unknownDevice,
    ).toBe("Unknown device");
    expect(
      resources.en.translation.dashboard.settings.security.recentActivity
        .confirm.closeAllTitle,
    ).toBe("Sign out all sessions");
    expect(
      resources.en.translation.dashboard.settings.security.recentActivity
        .confirm.confirm,
    ).toBe("Sign out");
    expect(
      resources.en.translation.dashboard.settings.security.recentActivity
        .feedback.closedAll,
    ).toBe("All other sessions were signed out.");
    expect(
      resources.en.translation.dashboard.settings.security.dangerZone.action,
    ).toBe("Delete my account permanently");
    expect(
      resources.en.translation.dashboard.settings.security.dangerZone.confirm,
    ).toEqual({
      title: "Delete account",
      body: "Are you sure you want to permanently delete your account? This action cannot be undone.",
      cancel: "Cancel",
      confirm: "Confirm",
    });
    expect(resources.en.translation.dashboard.settings.notifications.title).toBe(
      "Notification settings",
    );
    expect(
      resources.en.translation.dashboard.settings.notifications.options
        .upcomingPayments,
    ).toEqual({
      title: "Upcoming payments",
      description: "Get a reminder one week before your due date.",
    });
    expect(
      resources.en.translation.dashboard.settings.notifications.options
        .paymentAlerts,
    ).toEqual({
      title: "Payment alerts",
      description: "Notify when there are pending payments.",
    });
    expect(
      resources.en.translation.dashboard.settings.notifications.options
        .weeklySummary,
    ).toEqual({
      title: "Weekly summary",
      description: "Email with your weekly statistics.",
    });
  });
});
