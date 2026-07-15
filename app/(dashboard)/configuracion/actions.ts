"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
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
