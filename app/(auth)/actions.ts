"use server";

import { headers } from "next/headers";
import { getPrisma } from "@/lib/prisma";
import {
  createAccountVerificationOtp,
  discardAccountVerificationOtp,
  invalidatePreviousAccountVerificationOtps,
  verifyAccountVerificationOtp,
} from "@/lib/auth/account-verification";
import { sendAccountVerificationCodeEmail } from "@/lib/auth/account-verification-email";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  clearFailedLoginAttempts,
  getAccountVerificationEmailCooldown,
  getClientIpFromHeaders,
  hashClientIp,
  isLoginBlocked,
  recordAccountVerificationEmailAttempt,
  recordFailedLoginAttempt,
} from "@/lib/auth/rate-limit";
import { createSession } from "@/lib/auth/session";
import {
  accountNotVerifiedMessage,
  accountVerificationCodeSchema,
  invalidCredentialsMessage,
  loginSchema,
  registerSchema,
  tooManyLoginAttemptsMessage,
} from "@/lib/auth/validation";

export type AuthActionState =
  | {
      status: "idle";
      step?: "register" | "verify" | "verified";
      email?: string;
      message?: string;
      messageKey?: string;
      modalMessageKey?: string;
      cooldownUntil?: string;
      errors?: Record<string, string[] | undefined>;
    }
  | {
      status: "success";
      step?: "register" | "verify" | "verified";
      email?: string;
      message?: string;
      messageKey?: string;
      modalMessageKey?: string;
      cooldownUntil?: string;
      errors?: Record<string, string[] | undefined>;
    }
  | {
      status: "error";
      step?: "register" | "verify" | "verified";
      email?: string;
      message?: string;
      messageKey?: string;
      modalMessageKey?: string;
      cooldownUntil?: string;
      errors?: Record<string, string[] | undefined>;
    };

const invalidAccountVerificationCodeMessage =
  "El código de verificación no es válido o ya expiró.";
const accountVerificationEmailSendFailedMessage =
  "No se pudo enviar el código de verificación. Intenta nuevamente.";
const createAccountFailedMessage =
  "No se pudo crear la cuenta. Intenta nuevamente.";
const accountVerificationCooldownMessage =
  "Espera un momento antes de solicitar otro código.";

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function registerAction(
  _prevState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedInput = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    repeatPassword: formData.get("repeatPassword"),
  });
  const language =
    typeof formData.get("language") === "string"
      ? String(formData.get("language"))
      : undefined;

  if (!parsedInput.success) {
    return {
      status: "error",
      step: "register",
      errors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const { firstName, lastName, email, password } = parsedInput.data;
  const requestHeaders = await headers();
  const ipHash = hashClientIp(getClientIpFromHeaders(requestHeaders));
  const cooldownUntil = await getAccountVerificationEmailCooldown(
    email,
    ipHash,
  );

  if (cooldownUntil) {
    return {
      status: "error",
      step: "register",
      email,
      cooldownUntil: cooldownUntil.toISOString(),
      message: accountVerificationCooldownMessage,
      messageKey: "validation.accountVerificationCooldown",
    };
  }

  const passwordHash = await hashPassword(password);
  const prisma = getPrisma();
  let user: { id: string; email: string; emailVerifiedAt: Date | null };
  let createdNewUser = false;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
      },
    });

    if (existingUser?.emailVerifiedAt) {
      return {
        status: "error",
        step: "register",
        errors: {
          email: ["Este correo electrónico ya está registrado."],
        },
        messageKey: "validation.emailRegistered",
      };
    }

    if (existingUser) {
      user = await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          firstName,
          lastName,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          emailVerifiedAt: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          emailVerifiedAt: true,
        },
      });
      createdNewUser = true;
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        step: "register",
        errors: {
          email: ["Este correo electrónico ya está registrado."],
        },
        messageKey: "validation.emailRegistered",
      };
    }

    console.error("Failed to create account.", error);

    return {
      status: "error",
      step: "register",
      message: createAccountFailedMessage,
      messageKey: "validation.createAccountFailed",
    };
  }

  let verificationOtp: { id: string; code: string; expiresAt: Date };

  try {
    verificationOtp = await createAccountVerificationOtp(user.id);
  } catch (error) {
    console.error("Failed to create account verification OTP.", error);

    if (createdNewUser) {
      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });
    }

    return {
      status: "error",
      step: "register",
      message: createAccountFailedMessage,
      messageKey: "validation.createAccountFailed",
    };
  }

  try {
    await sendAccountVerificationCodeEmail({
      to: user.email,
      code: verificationOtp.code,
      expiresAt: verificationOtp.expiresAt,
      language,
    });
  } catch (error) {
    console.error("Failed to send account verification email.", error);
    await discardAccountVerificationOtp(verificationOtp.id);

    if (createdNewUser) {
      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });
    }

    return {
      status: "error",
      step: "register",
      message: accountVerificationEmailSendFailedMessage,
      messageKey: "validation.accountVerificationEmailSendFailed",
    };
  }

  try {
    await invalidatePreviousAccountVerificationOtps(user.id, verificationOtp.id);
    await recordAccountVerificationEmailAttempt(user.email, ipHash);
  } catch (error) {
    console.error("Failed to update account verification metadata.", error);
  }

  return {
    status: "success",
    step: "verify",
    email: user.email,
    modalMessageKey: "register.codeSentMessage",
  };
}

export async function verifyRegistrationCodeAction(
  _prevState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedInput = accountVerificationCodeSchema.safeParse({
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

  const verifiedOtp = await verifyAccountVerificationOtp(
    parsedInput.data.email,
    parsedInput.data.code,
  );

  if (!verifiedOtp) {
    return {
      status: "error",
      step: "verify",
      email: parsedInput.data.email,
      message: invalidAccountVerificationCodeMessage,
      messageKey: "validation.invalidAccountVerificationCode",
    };
  }

  return {
    status: "success",
    step: "verified",
    email: parsedInput.data.email,
    modalMessageKey: "register.accountVerifiedMessage",
  };
}

export async function loginAction(
  _prevState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedInput = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") === "on" ? "on" : undefined,
  });

  if (!parsedInput.success) {
    return {
      status: "error",
      message: invalidCredentialsMessage,
      messageKey: "validation.invalidCredentials",
    };
  }

  const { email, password, remember } = parsedInput.data;
  const requestHeaders = await headers();
  const ipHash = hashClientIp(getClientIpFromHeaders(requestHeaders));

  if (await isLoginBlocked(email, ipHash)) {
    return {
      status: "error",
      message: tooManyLoginAttemptsMessage,
      messageKey: "validation.tooManyLoginAttempts",
    };
  }

  const user = await getPrisma().user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      passwordHash: true,
      emailVerifiedAt: true,
    },
  });

  if (!user) {
    await recordFailedLoginAttempt(email, ipHash);

    return {
      status: "error",
      message: invalidCredentialsMessage,
      messageKey: "validation.invalidCredentials",
    };
  }

  if (!user.emailVerifiedAt) {
    return {
      status: "error",
      message: accountNotVerifiedMessage,
      messageKey: "validation.accountNotVerified",
    };
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    await recordFailedLoginAttempt(email, ipHash);

    return {
      status: "error",
      message: invalidCredentialsMessage,
      messageKey: "validation.invalidCredentials",
    };
  }

  await clearFailedLoginAttempts(email, ipHash);
  await createSession(user.id, remember);

  return {
    status: "success",
  };
}
