"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  destroyCurrentSession,
  requireSession,
} from "@/lib/auth/session";
import {
  cancelAccountDeletionOtp,
  createAccountDeletionOtp,
  verifyAccountDeletionOtp,
} from "@/lib/auth/account-deletion";
import { sendAccountDeletionCodeEmail } from "@/lib/auth/account-deletion-email";
import {
  cancelPasswordChangeOtp,
  createPasswordChangeOtp,
  verifyPasswordChangeOtp,
} from "@/lib/auth/password-change";
import { sendPasswordChangeCodeEmail } from "@/lib/auth/password-change-email";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isPasswordValid } from "@/lib/auth/password-requirements";
import { getPrisma } from "@/lib/prisma";
import { profileNameSchema, type ProfileNameInput } from "@/lib/dashboard/user";

export type DashboardProfileActionState =
  | {
      status: "idle";
      messageKey?: string;
      errors?: Record<string, string[] | undefined>;
      values?: ProfileNameInput;
    }
  | {
      status: "success";
      successId: string;
      messageKey: string;
      errors?: Record<string, string[] | undefined>;
      values: ProfileNameInput;
    }
  | {
      status: "error";
      messageKey?: string;
      errors?: Record<string, string[] | undefined>;
      values?: ProfileNameInput;
    };

export type DashboardSessionActionState =
  | {
      status: "success";
      messageKey: string;
      revokedCount?: number;
    }
  | {
      status: "error";
      messageKey: string;
      revokedCount?: number;
    };

export type DeleteAccountActionState =
  | {
      status: "success";
      maskedEmail?: string;
      messageKey?: string;
    }
  | {
      status: "error";
      messageKey: string;
      maskedEmail?: string;
    };

type PasswordChangeField = "currentPassword" | "newPassword" | "confirmPassword";

export type PasswordChangeActionState =
  | {
      status: "success";
      maskedEmail?: string;
      messageKey?: string;
    }
  | {
      status: "error";
      messageKey: string;
      maskedEmail?: string;
      errors?: Partial<Record<PasswordChangeField | "code", string>>;
    };

export type PasswordChangeSessionMode = "current" | "all";

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  return `${localPart.slice(0, 2)}${"*".repeat(
    Math.max(localPart.length - 2, 1),
  )}@${domain}`;
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function updateUserProfileAction(
  _prevState: DashboardProfileActionState | undefined,
  formData: FormData,
): Promise<DashboardProfileActionState> {
  const parsedInput = profileNameSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });

  if (!parsedInput.success) {
    return {
      status: "error",
      errors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const session = await requireSession();
  const values = parsedInput.data;

  await getPrisma().user.update({
    where: {
      id: session.userId,
    },
    data: values,
    select: {
      firstName: true,
      lastName: true,
    },
  });

  revalidatePath("/configuracion");

  return {
    status: "success",
    successId: crypto.randomUUID(),
    values,
    messageKey: "dashboard.settings.profile.feedback.saved",
  };
}

export async function revokeSessionAction(
  sessionId: string,
): Promise<DashboardSessionActionState> {
  const session = await requireSession();

  if (!sessionId || sessionId === session.sessionId) {
    return {
      status: "error",
      messageKey:
        "dashboard.settings.security.recentActivity.feedback.currentSession",
    };
  }

  const result = await getPrisma().session.deleteMany({
    where: {
      id: sessionId,
      userId: session.userId,
      NOT: {
        id: session.sessionId,
      },
    },
  });

  if (result.count === 0) {
    return {
      status: "error",
      messageKey:
        "dashboard.settings.security.recentActivity.feedback.notFound",
    };
  }

  revalidatePath("/configuracion");

  return {
    status: "success",
    messageKey: "dashboard.settings.security.recentActivity.feedback.closed",
  };
}

export async function revokeOtherSessionsAction(): Promise<DashboardSessionActionState> {
  const session = await requireSession();
  const result = await getPrisma().session.deleteMany({
    where: {
      userId: session.userId,
      NOT: {
        id: session.sessionId,
      },
    },
  });

  revalidatePath("/configuracion");

  return {
    status: "success",
    messageKey: "dashboard.settings.security.recentActivity.feedback.closedAll",
    revokedCount: result.count,
  };
}

function validatePasswordChangeInput({
  currentPassword,
  newPassword,
  confirmPassword,
}: {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}) {
  if (currentPassword !== undefined && !currentPassword) {
    return {
      messageKey: "dashboard.settings.security.password.feedback.currentRequired",
      errors: {
        currentPassword:
          "dashboard.settings.security.password.feedback.currentRequired",
      },
    };
  }

  if (!isPasswordValid(newPassword)) {
    return {
      messageKey: "dashboard.settings.security.password.feedback.invalidNew",
      errors: {
        newPassword: "dashboard.settings.security.password.feedback.invalidNew",
      },
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      messageKey: "validation.passwordMismatch",
      errors: {
        confirmPassword: "validation.passwordMismatch",
      },
    };
  }

  if (currentPassword !== undefined && currentPassword === newPassword) {
    return {
      messageKey:
        "dashboard.settings.security.password.feedback.newMustDiffer",
      errors: {
        newPassword:
          "dashboard.settings.security.password.feedback.newMustDiffer",
      },
    };
  }

  return null;
}

export async function requestPasswordChangeCodeAction(
  formData: FormData,
): Promise<PasswordChangeActionState> {
  const currentPassword = getFormString(formData, "currentPassword");
  const newPassword = getFormString(formData, "newPassword");
  const confirmPassword = getFormString(formData, "confirmPassword");
  const language = getFormString(formData, "language") || undefined;
  const inputError = validatePasswordChangeInput({
    currentPassword,
    newPassword,
    confirmPassword,
  });

  if (inputError) {
    return {
      status: "error",
      ...inputError,
    };
  }

  const session = await requireSession();
  const user = await getPrisma().user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    return {
      status: "error",
      messageKey: "dashboard.settings.security.password.feedback.invalidCurrent",
      errors: {
        currentPassword:
          "dashboard.settings.security.password.feedback.invalidCurrent",
      },
    };
  }

  const passwordChangeOtp = await createPasswordChangeOtp(user.id);

  try {
    await sendPasswordChangeCodeEmail({
      to: user.email,
      code: passwordChangeOtp.code,
      expiresAt: passwordChangeOtp.expiresAt,
      language,
    });
  } catch (error) {
    console.error("Failed to send password change email.", error);
    await cancelPasswordChangeOtp(user.id);

    return {
      status: "error",
      messageKey: "dashboard.settings.security.password.feedback.emailSendFailed",
    };
  }

  return {
    status: "success",
    maskedEmail: maskEmail(user.email),
  };
}

export async function cancelPasswordChangeAction(): Promise<PasswordChangeActionState> {
  const session = await requireSession();

  await cancelPasswordChangeOtp(session.userId);

  return {
    status: "success",
  };
}

export async function confirmPasswordChangeAction(
  formData: FormData,
): Promise<PasswordChangeActionState> {
  const code = getFormString(formData, "code").trim();
  const newPassword = getFormString(formData, "newPassword");
  const confirmPassword = getFormString(formData, "confirmPassword");
  const inputError = validatePasswordChangeInput({
    newPassword,
    confirmPassword,
  });

  if (inputError) {
    return {
      status: "error",
      ...inputError,
    };
  }

  if (!/^\d{6}$/.test(code)) {
    return {
      status: "error",
      messageKey: "dashboard.settings.security.password.feedback.invalidCode",
      errors: {
        code: "dashboard.settings.security.password.feedback.invalidCode",
      },
    };
  }

  const session = await requireSession();
  const verifiedOtp = await verifyPasswordChangeOtp(session.userId, code);

  if (!verifiedOtp) {
    return {
      status: "error",
      messageKey: "dashboard.settings.security.password.feedback.invalidCode",
      errors: {
        code: "dashboard.settings.security.password.feedback.invalidCode",
      },
    };
  }

  await getPrisma().user.update({
    where: {
      id: session.userId,
    },
    data: {
      passwordHash: await hashPassword(newPassword),
    },
    select: {
      id: true,
    },
  });

  revalidatePath("/configuracion");

  return {
    status: "success",
    messageKey: "dashboard.settings.security.password.feedback.changed",
  };
}

export async function completePasswordChangeSessionAction(
  mode: PasswordChangeSessionMode,
) {
  const session = await requireSession();

  if (mode === "all") {
    await getPrisma().session.deleteMany({
      where: {
        userId: session.userId,
      },
    });
  }

  await destroyCurrentSession();
  revalidatePath("/configuracion");

  redirect("/login");
}

export async function requestAccountDeletionCodeAction(
  formData: FormData,
): Promise<DeleteAccountActionState> {
  const password = getFormString(formData, "password");
  const language = getFormString(formData, "language") || undefined;

  if (!password) {
    return {
      status: "error",
      messageKey:
        "dashboard.settings.security.dangerZone.confirm.passwordRequired",
    };
  }

  const session = await requireSession();
  const user = await getPrisma().user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return {
      status: "error",
      messageKey:
        "dashboard.settings.security.dangerZone.confirm.invalidPassword",
    };
  }

  const deletionOtp = await createAccountDeletionOtp(user.id);

  try {
    await sendAccountDeletionCodeEmail({
      to: user.email,
      code: deletionOtp.code,
      expiresAt: deletionOtp.expiresAt,
      language,
    });
  } catch (error) {
    console.error("Failed to send account deletion email.", error);
    await cancelAccountDeletionOtp(user.id);

    return {
      status: "error",
      messageKey:
        "dashboard.settings.security.dangerZone.confirm.emailSendFailed",
    };
  }

  return {
    status: "success",
    maskedEmail: maskEmail(user.email),
  };
}

export async function cancelAccountDeletionAction(): Promise<DeleteAccountActionState> {
  const session = await requireSession();

  await cancelAccountDeletionOtp(session.userId);

  return {
    status: "success",
  };
}

export async function confirmAccountDeletionAction(
  formData: FormData,
): Promise<DeleteAccountActionState> {
  const code = getFormString(formData, "code").trim();

  if (!/^\d{6}$/.test(code)) {
    return {
      status: "error",
      messageKey:
        "dashboard.settings.security.dangerZone.confirm.invalidCode",
    };
  }

  const session = await requireSession();
  const verifiedOtp = await verifyAccountDeletionOtp(session.userId, code);

  if (!verifiedOtp) {
    return {
      status: "error",
      messageKey:
        "dashboard.settings.security.dangerZone.confirm.invalidCode",
    };
  }

  await getPrisma().user.delete({
    where: {
      id: session.userId,
    },
  });
  await destroyCurrentSession();

  redirect("/login");
}
