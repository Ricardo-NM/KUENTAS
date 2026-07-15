"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import {
  createPasswordResetOtp,
  createPasswordResetSessionValue,
  passwordResetSessionCookieName,
  verifyPasswordResetOtp,
  verifyPasswordResetSession,
} from "@/lib/auth/password-reset";
import { sendPasswordResetCodeEmail } from "@/lib/auth/password-reset-email";
import {
  passwordResetCodeSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
} from "@/lib/auth/validation";

export type RecoveryActionState = {
  status: "idle" | "success" | "error";
  step?: "request" | "verify" | "reset";
  email?: string;
  message?: string;
  messageKey?: string;
  errors?: Record<string, string[] | undefined>;
};

const invalidVerificationCodeMessage =
  "El codigo de verificacion no es valido o ya expiro.";
const emailSendFailedMessage =
  "No se pudo enviar el codigo de verificacion. Intenta nuevamente.";

function getPasswordResetCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/recuperacion",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

async function clearPasswordResetSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(
    passwordResetSessionCookieName,
    "",
    getPasswordResetCookieOptions(0),
  );
}

export async function requestPasswordResetAction(
  _prevState: RecoveryActionState | undefined,
  formData: FormData,
): Promise<RecoveryActionState> {
  const parsedInput = passwordResetRequestSchema.safeParse({
    email: formData.get("email"),
  });
  const language =
    typeof formData.get("language") === "string"
      ? String(formData.get("language"))
      : undefined;

  if (!parsedInput.success) {
    return {
      status: "error",
      step: "request",
      errors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const user = await getPrisma().user.findUnique({
    where: {
      email: parsedInput.data.email,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    return {
      status: "success",
      step: "verify",
      email: parsedInput.data.email,
    };
  }

  const resetOtp = await createPasswordResetOtp(user.id);

  try {
    await sendPasswordResetCodeEmail({
      to: user.email,
      code: resetOtp.code,
      expiresAt: resetOtp.expiresAt,
      language,
    });
  } catch {
    return {
      status: "error",
      step: "request",
      email: parsedInput.data.email,
      message: emailSendFailedMessage,
      messageKey: "validation.resetEmailSendFailed",
    };
  }

  return {
    status: "success",
    step: "verify",
    email: parsedInput.data.email,
  };
}

export async function verifyPasswordResetCodeAction(
  _prevState: RecoveryActionState | undefined,
  formData: FormData,
): Promise<RecoveryActionState> {
  const parsedInput = passwordResetCodeSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });

  if (!parsedInput.success) {
    return {
      status: "error",
      step: "verify",
      email:
        typeof formData.get("email") === "string"
          ? String(formData.get("email"))
          : undefined,
      errors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const verifiedOtp = await verifyPasswordResetOtp(
    parsedInput.data.email,
    parsedInput.data.code,
  );

  if (!verifiedOtp) {
    return {
      status: "error",
      step: "verify",
      email: parsedInput.data.email,
      message: invalidVerificationCodeMessage,
      messageKey: "validation.invalidVerificationCode",
    };
  }

  const cookieStore = await cookies();
  const maxAge = Math.max(
    0,
    Math.floor((verifiedOtp.expiresAt.getTime() - Date.now()) / 1000),
  );

  cookieStore.set(
    passwordResetSessionCookieName,
    createPasswordResetSessionValue({
      id: verifiedOtp.id,
      userId: verifiedOtp.userId,
      expiresAt: verifiedOtp.expiresAt.toISOString(),
    }),
    getPasswordResetCookieOptions(maxAge),
  );

  return {
    status: "success",
    step: "reset",
    email: parsedInput.data.email,
  };
}

export async function resetPasswordAction(
  _prevState: RecoveryActionState | undefined,
  formData: FormData,
): Promise<RecoveryActionState> {
  const parsedInput = passwordResetSchema.safeParse({
    password: formData.get("password"),
    repeatPassword: formData.get("repeatPassword"),
  });

  if (!parsedInput.success) {
    return {
      status: "error",
      step: "reset",
      errors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const cookieStore = await cookies();
  const resetSession = await verifyPasswordResetSession(
    cookieStore.get(passwordResetSessionCookieName)?.value,
  );

  if (!resetSession) {
    return {
      status: "error",
      step: "reset",
      message: invalidVerificationCodeMessage,
      messageKey: "validation.invalidVerificationCode",
    };
  }

  const passwordHash = await hashPassword(parsedInput.data.password);
  const prisma = getPrisma();

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: resetSession.userId,
      },
      data: {
        passwordHash,
      },
    }),
    prisma.session.deleteMany({
      where: {
        userId: resetSession.userId,
      },
    }),
    prisma.passwordResetToken.update({
      where: {
        id: resetSession.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),
  ]);

  await clearPasswordResetSessionCookie();
  redirect("/login");
}
