"use server";

import { getPrisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import {
  clearFailedLoginAttempts,
  getClientIpFromHeaders,
  hashClientIp,
  isLoginBlocked,
  recordFailedLoginAttempt,
} from "@/lib/auth/rate-limit";
import {
  invalidCredentialsMessage,
  loginSchema,
  registerSchema,
  tooManyLoginAttemptsMessage,
} from "@/lib/auth/validation";
import { headers } from "next/headers";

export type AuthActionState =
  | {
      status: "idle";
      message?: string;
      errors?: Record<string, string[] | undefined>;
    }
  | {
      status: "success";
      message?: string;
      errors?: Record<string, string[] | undefined>;
    }
  | {
      status: "error";
      message?: string;
      errors?: Record<string, string[] | undefined>;
    };

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

  if (!parsedInput.success) {
    return {
      status: "error",
      errors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const { firstName, lastName, email, password } = parsedInput.data;
  const passwordHash = await hashPassword(password);

  try {
    await getPrisma().user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
      },
      select: {
        id: true,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        errors: {
          email: ["Este correo electrónico ya está registrado."],
        },
      };
    }

    return {
      status: "error",
      message: "No se pudo crear la cuenta. Intenta nuevamente.",
    };
  }

  return {
    status: "success",
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
    };
  }

  const { email, password, remember } = parsedInput.data;
  const requestHeaders = await headers();
  const ipHash = hashClientIp(getClientIpFromHeaders(requestHeaders));

  if (await isLoginBlocked(email, ipHash)) {
    return {
      status: "error",
      message: tooManyLoginAttemptsMessage,
    };
  }

  const user = await getPrisma().user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    await recordFailedLoginAttempt(email, ipHash);

    return {
      status: "error",
      message: invalidCredentialsMessage,
    };
  }

  const passwordMatches = await verifyPassword(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    await recordFailedLoginAttempt(email, ipHash);

    return {
      status: "error",
      message: invalidCredentialsMessage,
    };
  }

  await clearFailedLoginAttempts(email, ipHash);
  await createSession(user.id, remember);

  return {
    status: "success",
  };
}
