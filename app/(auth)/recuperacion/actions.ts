"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import {
  buildPasswordResetUrl,
  createPasswordResetToken,
  verifyPasswordResetToken,
} from "@/lib/auth/password-reset";
import {
  passwordResetRequestSchema,
  passwordResetSchema,
} from "@/lib/auth/validation";

export type RecoveryActionState =
  | {
      status: "idle";
      message?: string;
      devResetUrl?: string;
      errors?: Record<string, string[] | undefined>;
    }
  | {
      status: "success";
      message?: string;
      devResetUrl?: string;
      errors?: Record<string, string[] | undefined>;
    }
  | {
      status: "error";
      message?: string;
      devResetUrl?: string;
      errors?: Record<string, string[] | undefined>;
    };

const resetRequestSuccessMessage =
  "Si el correo existe, enviaremos un enlace para restablecer tu contraseña.";
const invalidResetTokenMessage =
  "El enlace de recuperación no es válido o ya expiró.";

async function getRequestOrigin() {
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const host = headersList.get("host") ?? "localhost:3000";

  return `${protocol}://${host}`;
}

export async function requestPasswordResetAction(
  _prevState: RecoveryActionState | undefined,
  formData: FormData,
): Promise<RecoveryActionState> {
  const parsedInput = passwordResetRequestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsedInput.success) {
    return {
      status: "error",
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
      message: resetRequestSuccessMessage,
    };
  }

  const resetToken = await createPasswordResetToken(user.id);
  const resetUrl = buildPasswordResetUrl(
    await getRequestOrigin(),
    resetToken.token,
  );

  return {
    status: "success",
    message: resetRequestSuccessMessage,
    devResetUrl: process.env.NODE_ENV === "production" ? undefined : resetUrl,
  };
}

export async function resetPasswordAction(
  _prevState: RecoveryActionState | undefined,
  formData: FormData,
): Promise<RecoveryActionState> {
  const parsedInput = passwordResetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    repeatPassword: formData.get("repeatPassword"),
  });

  if (!parsedInput.success) {
    return {
      status: "error",
      errors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const resetToken = await verifyPasswordResetToken(parsedInput.data.token);

  if (!resetToken) {
    return {
      status: "error",
      message: invalidResetTokenMessage,
    };
  }

  const passwordHash = await hashPassword(parsedInput.data.password);
  const prisma = getPrisma();

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        passwordHash,
      },
    }),
    prisma.session.deleteMany({
      where: {
        userId: resetToken.userId,
      },
    }),
    prisma.passwordResetToken.update({
      where: {
        id: resetToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),
  ]);

  redirect("/login");
}
