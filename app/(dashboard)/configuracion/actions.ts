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
import { verifyPassword } from "@/lib/auth/password";
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
