export const dashboardSettingsSections = [
  {
    id: "general",
    labelKey: "dashboard.settings.sections.general",
    fallbackLabels: {
      es: "General",
      en: "General",
    },
    icon: "cog",
  },
  {
    id: "perfil",
    labelKey: "dashboard.settings.sections.perfil",
    fallbackLabels: {
      es: "Perfil de usuario",
      en: "User profile",
    },
    icon: "user-round-cog",
  },
  {
    id: "notificaciones",
    labelKey: "dashboard.settings.sections.notificaciones",
    fallbackLabels: {
      es: "Notificaciones",
      en: "Notifications",
    },
    icon: "bell",
  },
  {
    id: "seguridad",
    labelKey: "dashboard.settings.sections.seguridad",
    fallbackLabels: {
      es: "Seguridad",
      en: "Security",
    },
    icon: "shield-check",
  },
] as const;

export const dashboardSettingsFallbackCopy = {
  es: {
    title: "Configuración",
    description: "Administra tu perfil, preferencias y seguridad de la cuenta.",
    navigationLabel: "Secciones de configuración",
    greeting: "Saludos desde {{section}}",
    generalTitle: "Configuración general",
    interfaceLanguageLabel: "Idioma de la interfaz",
    currencyLabel: "Moneda principal",
    dateFormatLabel: "Formato de fecha",
    weekStartLabel: "Primer día de la semana",
    monday: "Lunes",
    sunday: "Domingo",
    visualThemeLabel: "Tema visual",
    lightTheme: "Claro",
    darkTheme: "Oscuro",
    profileTitle: "Perfil de usuario",
    profilePhotoTitle: "Foto de perfil",
    profilePhotoHelp: "PNG o JPG de hasta 5MB.",
    profileUpload: "Subir nueva",
    profileDelete: "Eliminar",
    profilePhotoDeleting: "Eliminando...",
    profilePhotoCropTitle: "Recortar foto de perfil",
    profilePhotoCropDescription:
      "Ajusta la imagen dentro del circulo antes de guardarla.",
    profilePhotoCropZoom: "Zoom",
    profilePhotoCropCancel: "Cancelar",
    profilePhotoCropSave: "Guardar",
    profilePhotoCropSaving: "Guardando...",
    profilePhotoTooLarge: "El archivo supera los 5MB.",
    profilePhotoInvalidType: "Solo puedes subir imagenes PNG o JPG.",
    profilePhotoInvalidFile: "Selecciona una imagen valida.",
    profilePhotoSaved: "Foto de perfil actualizada.",
    profilePhotoDeleted: "Foto de perfil eliminada.",
    profilePhotoSaveFailed: "No se pudo guardar la foto de perfil.",
    profilePhotoDeleteFailed: "No se pudo eliminar la foto de perfil.",
    profileFirstName: "Nombre",
    profileLastName: "Apellidos",
    profileEmail: "Correo electrónico",
    profileCancel: "Cancelar",
    profileSave: "Guardar",
    profileSaving: "Guardando...",
    profileSaved: "Cambios guardados correctamente.",
    profileAvatarLabel: "Cambiar foto de perfil",
    securityTitle: "Seguridad de la cuenta",
    securityPasswordTitle: "Contraseña",
    securityCurrentPassword: "Contraseña actual",
    securityNewPassword: "Nueva contraseña",
    securityConfirmPassword: "Confirmar contraseña",
    securityPasswordSave: "Guardar",
    securityPasswordSendingCode: "Enviando...",
    securityPasswordVerify: "Verificar",
    securityPasswordVerifying: "Verificando...",
    securityPasswordCodeLabel: "Código de verificación",
    securityPasswordNoticeTitle: "Revisa tu correo electrónico",
    securityPasswordNoticeBody:
      "Se ha enviado un código de verificación a {{email}} para confirmar el cambio de contraseña.",
    securityPasswordNoticeAction: "Entendido",
    securityPasswordSessionTitle: "Contraseña cambiada correctamente",
    securityPasswordSessionBody:
      "Para proteger tu cuenta, cierra sesión y vuelve a iniciar con tu nueva contraseña.",
    securityPasswordCloseCurrent: "Cerrar sesión activa",
    securityPasswordCloseAll: "Cerrar todas",
    securityPasswordConfirmMatch: "Las contraseñas coinciden.",
    securityPasswordActionFeedback:
      "No se pudo completar el cambio de contraseña.",
    securityTwoFactorTitle: "Autenticación de dos pasos (2FA)",
    securityTwoFactorDescription:
      "Añade una capa extra de seguridad a tu cuenta de Kuentas.",
    securityTwoFactorEnabled: "2FA activado",
    securityRecentActivityTitle: "Actividad reciente",
    securityDesktopSessionDevice: "MacBook Pro - Chrome",
    securityDesktopSessionMeta: "Madrid, ES · Activo ahora",
    securityCurrentSession: "Sesión actual",
    securityMobileSessionDevice: "iPhone 15 - App Móvil",
    securityMobileSessionMeta: "Barcelona, ES · Hace 2 horas",
    securitySignOut: "Cerrar sesión",
    securityCloseAllSessions: "Cerrar todas",
    securityActiveNow: "Activo ahora",
    securityUnknownDevice: "Dispositivo desconocido",
    securityNoSessions: "No hay sesiones activas para mostrar.",
    securityConfirmCloseTitle: "Cerrar esta sesión",
    securityConfirmCloseBody:
      "Se cerrará la sesión de {{device}}. Ese dispositivo tendrá que volver a iniciar sesión.",
    securityConfirmCloseAllTitle: "Cerrar todas las sesiones",
    securityConfirmCloseAllBody:
      "Se cerrarán todas las sesiones excepto esta. Los demás dispositivos tendrán que volver a iniciar sesión.",
    securityConfirmCancel: "Cancelar",
    securityConfirmAction: "Cerrar sesión",
    securityConfirmAllAction: "Cerrar sesiones",
    securityClosingSession: "Cerrando...",
    securitySessionActionFeedback: "Actividad de sesiones actualizada.",
    securitySessionClosed: "Sesión cerrada correctamente.",
    securityAllSessionsClosed: "Todas las demás sesiones fueron cerradas.",
    securityCurrentSessionBlocked:
      "No puedes cerrar la sesión actual desde aquí.",
    securitySessionNotFound: "La sesión ya no está disponible.",
    securityDangerTitle: "Zona de peligro",
    securityDangerDescription:
      "Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de haber exportado tus datos financieros si los necesitas.",
    securityDangerAction: "Eliminar mi cuenta permanentemente",
    securityDeleteAccountConfirmTitle: "Eliminar cuenta",
    securityDeleteAccountConfirmBody:
      "¿Estas seguro de eliminar tu cuenta permanentemente? Esta acción no se puede revertir.",
    securityDeleteAccountConfirmCancel: "Cancelar",
    securityDeleteAccountConfirmAction: "Confirmar",
    securityDeleteAccountPasswordLabel: "Ingresa tu contraseña",
    securityDeleteAccountCodeTitle: "Verificación para eliminar cuenta",
    securityDeleteAccountCodeBody:
      "Ingresa el código de verificación enviado a {{email}} para continuar.",
    securityDeleteAccountCodeLabel: "Código de verificación",
    securityDeleteAccountFinalAction: "Eliminar cuenta",
    securityDeleteAccountSendingCode: "Enviando...",
    securityDeleteAccountDeleting: "Eliminando...",
    securityDeleteAccountActionFeedback:
      "No se pudo completar la eliminación de la cuenta.",
    notificationsTitle: "Ajustes de notificaciones",
    upcomingPaymentsTitle: "Pagos próximos",
    upcomingPaymentsDescription:
      "Recibe un aviso una semana antes de tu fecha límite.",
    paymentAlertsTitle: "Alertas de pago",
    paymentAlertsDescription: "Notificar cuando existan pagos pendientes.",
    weeklySummaryTitle: "Resumen semanal",
    weeklySummaryDescription:
      "Correo electrónico con tus estadísticas de la semana.",
  },
  en: {
    title: "Settings",
    description: "Manage your profile, preferences, and account security.",
    navigationLabel: "Settings sections",
    greeting: "Greetings from {{section}}",
    generalTitle: "General settings",
    interfaceLanguageLabel: "Interface language",
    currencyLabel: "Primary currency",
    dateFormatLabel: "Date format",
    weekStartLabel: "First day of the week",
    monday: "Monday",
    sunday: "Sunday",
    visualThemeLabel: "Visual theme",
    lightTheme: "Light",
    darkTheme: "Dark",
    profileTitle: "User profile",
    profilePhotoTitle: "Profile photo",
    profilePhotoHelp: "PNG or JPG up to 5MB.",
    profileUpload: "Upload new",
    profileDelete: "Remove",
    profilePhotoDeleting: "Removing...",
    profilePhotoCropTitle: "Crop profile photo",
    profilePhotoCropDescription:
      "Adjust the image inside the circle before saving it.",
    profilePhotoCropZoom: "Zoom",
    profilePhotoCropCancel: "Cancel",
    profilePhotoCropSave: "Save",
    profilePhotoCropSaving: "Saving...",
    profilePhotoTooLarge: "The file is larger than 5MB.",
    profilePhotoInvalidType: "You can only upload PNG or JPG images.",
    profilePhotoInvalidFile: "Select a valid image.",
    profilePhotoSaved: "Profile photo updated.",
    profilePhotoDeleted: "Profile photo removed.",
    profilePhotoSaveFailed: "We could not save the profile photo.",
    profilePhotoDeleteFailed: "We could not remove the profile photo.",
    profileFirstName: "First name",
    profileLastName: "Last name",
    profileEmail: "Email address",
    profileCancel: "Cancel",
    profileSave: "Save",
    profileSaving: "Saving...",
    profileSaved: "Changes saved successfully.",
    profileAvatarLabel: "Change profile photo",
    securityTitle: "Account security",
    securityPasswordTitle: "Password",
    securityCurrentPassword: "Current password",
    securityNewPassword: "New password",
    securityConfirmPassword: "Confirm password",
    securityPasswordSave: "Save",
    securityPasswordSendingCode: "Sending...",
    securityPasswordVerify: "Verify",
    securityPasswordVerifying: "Verifying...",
    securityPasswordCodeLabel: "Verification code",
    securityPasswordNoticeTitle: "Check your email",
    securityPasswordNoticeBody:
      "A verification code was sent to {{email}} to confirm your password change.",
    securityPasswordNoticeAction: "Got it",
    securityPasswordSessionTitle: "Password changed successfully",
    securityPasswordSessionBody:
      "To protect your account, sign out and log back in with your new password.",
    securityPasswordCloseCurrent: "Sign out active session",
    securityPasswordCloseAll: "Sign out all",
    securityPasswordConfirmMatch: "Passwords match.",
    securityPasswordActionFeedback:
      "We could not complete the password change.",
    securityTwoFactorTitle: "Two-factor authentication (2FA)",
    securityTwoFactorDescription:
      "Add an extra layer of security to your Kuentas account.",
    securityTwoFactorEnabled: "2FA enabled",
    securityRecentActivityTitle: "Recent activity",
    securityDesktopSessionDevice: "MacBook Pro - Chrome",
    securityDesktopSessionMeta: "Madrid, ES · Active now",
    securityCurrentSession: "Current session",
    securityMobileSessionDevice: "iPhone 15 - Mobile App",
    securityMobileSessionMeta: "Barcelona, ES · 2 hours ago",
    securitySignOut: "Sign out",
    securityCloseAllSessions: "Sign out all",
    securityActiveNow: "Active now",
    securityUnknownDevice: "Unknown device",
    securityNoSessions: "There are no active sessions to show.",
    securityConfirmCloseTitle: "Sign out this session",
    securityConfirmCloseBody:
      "The session on {{device}} will be signed out. That device will need to log in again.",
    securityConfirmCloseAllTitle: "Sign out all sessions",
    securityConfirmCloseAllBody:
      "All sessions except this one will be signed out. Other devices will need to log in again.",
    securityConfirmCancel: "Cancel",
    securityConfirmAction: "Sign out",
    securityConfirmAllAction: "Sign out sessions",
    securityClosingSession: "Signing out...",
    securitySessionActionFeedback: "Session activity updated.",
    securitySessionClosed: "Session signed out successfully.",
    securityAllSessionsClosed: "All other sessions were signed out.",
    securityCurrentSessionBlocked:
      "You cannot sign out the current session here.",
    securitySessionNotFound: "The session is no longer available.",
    securityDangerTitle: "Danger zone",
    securityDangerDescription:
      "Once you delete your account, there is no going back. Please make sure you have exported any financial data you need.",
    securityDangerAction: "Delete my account permanently",
    securityDeleteAccountConfirmTitle: "Delete account",
    securityDeleteAccountConfirmBody:
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
    securityDeleteAccountConfirmCancel: "Cancel",
    securityDeleteAccountConfirmAction: "Confirm",
    securityDeleteAccountPasswordLabel: "Enter your password",
    securityDeleteAccountCodeTitle: "Account deletion verification",
    securityDeleteAccountCodeBody:
      "Enter the verification code sent to {{email}} to continue.",
    securityDeleteAccountCodeLabel: "Verification code",
    securityDeleteAccountFinalAction: "Delete account",
    securityDeleteAccountSendingCode: "Sending...",
    securityDeleteAccountDeleting: "Deleting...",
    securityDeleteAccountActionFeedback:
      "We could not complete the account deletion.",
    notificationsTitle: "Notification settings",
    upcomingPaymentsTitle: "Upcoming payments",
    upcomingPaymentsDescription:
      "Get a reminder one week before your due date.",
    paymentAlertsTitle: "Payment alerts",
    paymentAlertsDescription: "Notify when there are pending payments.",
    weeklySummaryTitle: "Weekly summary",
    weeklySummaryDescription: "Email with your weekly statistics.",
  },
} as const;

export const dashboardNotificationOptions = [
  {
    id: "upcoming-payments",
    titleKey: "dashboard.settings.notifications.options.upcomingPayments.title",
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
    titleKey: "dashboard.settings.notifications.options.paymentAlerts.title",
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
    titleKey: "dashboard.settings.notifications.options.weeklySummary.title",
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
  {
    id: "new-features",
    titleKey: "dashboard.settings.notifications.options.newFeatures.title",
    descriptionKey:
      "dashboard.settings.notifications.options.newFeatures.description",
    icon: "blocks",
    initiallyEnabled: true,
    fallbackTitles: {
      es: "Nuevas funcionalidades",
      en: "New features",
    },
    fallbackDescriptions: {
      es: "Entérate de nuevas funcionalidades vía correo electrónico.",
      en: "Hear about new features by email.",
    },
  },
] as const;

export const dashboardCurrencyOptions = [
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
] as const;

export const dashboardDateFormatOptions = [
  {
    value: "DD/MM/YYYY",
    labelKey: "dashboard.settings.general.dateFormat.options.dayMonthYear",
    fallbackLabels: {
      es: "DD/MM/YYYY",
      en: "DD/MM/YYYY",
    },
  },
  {
    value: "MM/DD/YYYY",
    labelKey: "dashboard.settings.general.dateFormat.options.monthDayYear",
    fallbackLabels: {
      es: "MM/DD/YYYY",
      en: "MM/DD/YYYY",
    },
  },
  {
    value: "YYYY/MM/DD",
    labelKey: "dashboard.settings.general.dateFormat.options.yearMonthDay",
    fallbackLabels: {
      es: "YYYY/MM/DD",
      en: "YYYY/MM/DD",
    },
  },
] as const;

export const dashboardWeekStartOptions = [
  {
    value: "monday",
    labelKey: "dashboard.settings.general.weekStart.options.monday",
    fallbackLabels: {
      es: "Lunes",
      en: "Monday",
    },
  },
  {
    value: "sunday",
    labelKey: "dashboard.settings.general.weekStart.options.sunday",
    fallbackLabels: {
      es: "Domingo",
      en: "Sunday",
    },
  },
] as const;

export type DashboardSettingsSection =
  (typeof dashboardSettingsSections)[number];
export type DashboardSettingsSectionId = DashboardSettingsSection["id"];
export type DashboardSettingsIcon = DashboardSettingsSection["icon"];
export type DashboardNotificationOption =
  (typeof dashboardNotificationOptions)[number];
export type DashboardNotificationIcon = DashboardNotificationOption["icon"];

export const dashboardSettingsSectionParamName = "seccion";

export function isDashboardSettingsSectionId(
  value: string | null | undefined,
): value is DashboardSettingsSectionId {
  return dashboardSettingsSections.some((section) => section.id === value);
}

export function getDashboardSettingsSectionHref(
  sectionId: DashboardSettingsSectionId,
): `/configuracion?seccion=${DashboardSettingsSectionId}` {
  return `/configuracion?${dashboardSettingsSectionParamName}=${sectionId}`;
}
