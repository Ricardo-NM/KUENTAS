import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  loginAction,
  registerAction,
  verifyRegistrationCodeAction,
} from "./actions";
import {
  accountNotVerifiedMessage,
  invalidCredentialsMessage,
  tooManyLoginAttemptsMessage,
} from "@/lib/auth/validation";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  userCreate: vi.fn(),
  userDelete: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
  createSession: vi.fn(),
  clearFailedLoginAttempts: vi.fn(),
  getAccountVerificationEmailCooldown: vi.fn(),
  isLoginBlocked: vi.fn(),
  recordAccountVerificationEmailAttempt: vi.fn(),
  recordFailedLoginAttempt: vi.fn(),
  createAccountVerificationOtp: vi.fn(),
  discardAccountVerificationOtp: vi.fn(),
  invalidatePreviousAccountVerificationOtps: vi.fn(),
  verifyAccountVerificationOtp: vi.fn(),
  sendAccountVerificationCodeEmail: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    user: {
      create: mocks.userCreate,
      delete: mocks.userDelete,
      findUnique: mocks.userFindUnique,
      update: mocks.userUpdate,
    },
  }),
}));

vi.mock("@/lib/auth/account-verification", () => ({
  createAccountVerificationOtp: mocks.createAccountVerificationOtp,
  discardAccountVerificationOtp: mocks.discardAccountVerificationOtp,
  invalidatePreviousAccountVerificationOtps:
    mocks.invalidatePreviousAccountVerificationOtps,
  verifyAccountVerificationOtp: mocks.verifyAccountVerificationOtp,
}));

vi.mock("@/lib/auth/account-verification-email", () => ({
  sendAccountVerificationCodeEmail: mocks.sendAccountVerificationCodeEmail,
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: mocks.hashPassword,
  verifyPassword: mocks.verifyPassword,
}));

vi.mock("@/lib/auth/session", () => ({
  createSession: mocks.createSession,
}));

vi.mock("@/lib/auth/rate-limit", () => ({
  clearFailedLoginAttempts: mocks.clearFailedLoginAttempts,
  getAccountVerificationEmailCooldown:
    mocks.getAccountVerificationEmailCooldown,
  getClientIpFromHeaders: (headersList: Headers) =>
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
  hashClientIp: () =>
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  isLoginBlocked: mocks.isLoginBlocked,
  recordAccountVerificationEmailAttempt:
    mocks.recordAccountVerificationEmailAttempt,
  recordFailedLoginAttempt: mocks.recordFailedLoginAttempt,
}));

function formData(input: Record<string, string>) {
  const data = new FormData();

  for (const [key, value] of Object.entries(input)) {
    data.set(key, value);
  }

  return data;
}

describe("auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hashPassword.mockResolvedValue("hashed-password");
    mocks.verifyPassword.mockResolvedValue(true);
    mocks.createSession.mockResolvedValue({
      cookieValue: "session.token",
      expiresAt: new Date("2030-01-01T00:00:00.000Z"),
    });
    mocks.userFindUnique.mockResolvedValue(null);
    mocks.getAccountVerificationEmailCooldown.mockResolvedValue(null);
    mocks.isLoginBlocked.mockResolvedValue(false);
    mocks.headers.mockResolvedValue(
      new Headers({
        "x-forwarded-for": "203.0.113.10",
      }),
    );
    mocks.createAccountVerificationOtp.mockResolvedValue({
      id: "verification_123",
      code: "123456",
      expiresAt: new Date("2030-01-01T00:10:00.000Z"),
    });
    mocks.sendAccountVerificationCodeEmail.mockResolvedValue(undefined);
    mocks.invalidatePreviousAccountVerificationOtps.mockResolvedValue(
      undefined,
    );
    mocks.recordAccountVerificationEmailAttempt.mockResolvedValue(
      new Date("2030-01-01T00:01:00.000Z"),
    );
  });

  it("does not create users when registration input is invalid", async () => {
    const result = await registerAction(undefined, formData({}));

    expect(result.status).toBe("error");
    expect(result.step).toBe("register");
    expect(result.errors?.email).toBeDefined();
    expect(mocks.userCreate).not.toHaveBeenCalled();
  });

  it("creates unverified users and emails an account verification OTP", async () => {
    mocks.userCreate.mockResolvedValue({
      id: "user_123",
      email: "user@example.com",
    });

    const result = await registerAction(
      undefined,
      formData({
        firstName: "Renato",
        lastName: "Morales",
        email: "  USER@Example.COM ",
        password: "Password1!",
        repeatPassword: "Password1!",
        language: "en",
      }),
    );

    expect(result).toEqual({
      status: "success",
      step: "verify",
      email: "user@example.com",
      modalMessageKey: "register.codeSentMessage",
    });
    expect(mocks.hashPassword).toHaveBeenCalledWith("Password1!");
    expect(mocks.userCreate).toHaveBeenCalledWith({
      data: {
        firstName: "Renato",
        lastName: "Morales",
        email: "user@example.com",
        passwordHash: "hashed-password",
      },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
      },
    });
    expect(mocks.createAccountVerificationOtp).toHaveBeenCalledWith("user_123");
    expect(mocks.sendAccountVerificationCodeEmail).toHaveBeenCalledWith({
      to: "user@example.com",
      code: "123456",
      expiresAt: new Date("2030-01-01T00:10:00.000Z"),
      language: "en",
    });
    expect(mocks.invalidatePreviousAccountVerificationOtps).toHaveBeenCalledWith(
      "user_123",
      "verification_123",
    );
    expect(mocks.recordAccountVerificationEmailAttempt).toHaveBeenCalledWith(
      "user@example.com",
      expect.stringMatching(/^[a-f0-9]{64}$/),
    );
  });

  it("resends verification for an existing unverified account and replaces the pending profile data", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "user_123",
      email: "user@example.com",
      emailVerifiedAt: null,
    });
    mocks.userUpdate.mockResolvedValue({
      id: "user_123",
      email: "user@example.com",
      emailVerifiedAt: null,
    });

    const result = await registerAction(
      undefined,
      formData({
        firstName: "Nuevo",
        lastName: "Intento",
        email: "USER@example.com",
        password: "Password1!",
        repeatPassword: "Password1!",
      }),
    );

    expect(result).toMatchObject({
      status: "success",
      step: "verify",
      email: "user@example.com",
    });
    expect(mocks.userCreate).not.toHaveBeenCalled();
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: {
        id: "user_123",
      },
      data: {
        firstName: "Nuevo",
        lastName: "Intento",
        passwordHash: "hashed-password",
      },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
      },
    });
    expect(mocks.createAccountVerificationOtp).toHaveBeenCalledWith("user_123");
    expect(mocks.invalidatePreviousAccountVerificationOtps).toHaveBeenCalledWith(
      "user_123",
      "verification_123",
    );
  });

  it("blocks registration email sends during an active account verification cooldown", async () => {
    mocks.getAccountVerificationEmailCooldown.mockResolvedValue(
      new Date("2030-01-01T00:01:00.000Z"),
    );

    const result = await registerAction(
      undefined,
      formData({
        firstName: "Renato",
        lastName: "Morales",
        email: "user@example.com",
        password: "Password1!",
        repeatPassword: "Password1!",
      }),
    );

    expect(result).toMatchObject({
      status: "error",
      step: "register",
      email: "user@example.com",
      cooldownUntil: "2030-01-01T00:01:00.000Z",
      messageKey: "validation.accountVerificationCooldown",
    });
    expect(mocks.hashPassword).not.toHaveBeenCalled();
    expect(mocks.userCreate).not.toHaveBeenCalled();
    expect(mocks.sendAccountVerificationCodeEmail).not.toHaveBeenCalled();
  });

  it("verifies a registration OTP", async () => {
    mocks.verifyAccountVerificationOtp.mockResolvedValue({
      id: "verification_123",
      userId: "user_123",
      verifiedAt: new Date("2030-01-01T00:00:00.000Z"),
    });

    const result = await verifyRegistrationCodeAction(
      undefined,
      formData({
        email: "USER@example.com",
        code: "123456",
      }),
    );

    expect(result).toEqual({
      status: "success",
      step: "verified",
      email: "user@example.com",
      modalMessageKey: "register.accountVerifiedMessage",
    });
    expect(mocks.verifyAccountVerificationOtp).toHaveBeenCalledWith(
      "user@example.com",
      "123456",
    );
  });

  it("returns a generic login error when credentials are invalid", async () => {
    mocks.userFindUnique.mockResolvedValue(null);

    const result = await loginAction(
      undefined,
      formData({
        email: "missing@example.com",
        password: "Password1!",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message: invalidCredentialsMessage,
      messageKey: "validation.invalidCredentials",
    });
    expect(mocks.recordFailedLoginAttempt).toHaveBeenCalledWith(
      "missing@example.com",
      expect.stringMatching(/^[a-f0-9]{64}$/),
    );
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("blocks login before checking credentials after five failed attempts", async () => {
    mocks.isLoginBlocked.mockResolvedValue(true);

    const result = await loginAction(
      undefined,
      formData({
        email: "blocked@example.com",
        password: "Password1!",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message: tooManyLoginAttemptsMessage,
      messageKey: "validation.tooManyLoginAttempts",
    });
    expect(mocks.isLoginBlocked).toHaveBeenCalledWith(
      "blocked@example.com",
      expect.stringMatching(/^[a-f0-9]{64}$/),
    );
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
    expect(mocks.recordFailedLoginAttempt).not.toHaveBeenCalled();
  });

  it("blocks unverified accounts before checking the password", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "user_123",
      passwordHash: "hashed-password",
      emailVerifiedAt: null,
    });

    const result = await loginAction(
      undefined,
      formData({
        email: "user@example.com",
        password: "Password1!",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message: accountNotVerifiedMessage,
      messageKey: "validation.accountNotVerified",
    });
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
    expect(mocks.recordFailedLoginAttempt).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("creates a remembered session when login succeeds", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "user_123",
      passwordHash: "hashed-password",
      emailVerifiedAt: new Date("2030-01-01T00:00:00.000Z"),
    });

    const result = await loginAction(
      undefined,
      formData({
        email: "USER@Example.COM",
        password: "Password1!",
        remember: "on",
      }),
    );

    expect(result).toEqual({ status: "success" });
    expect(mocks.verifyPassword).toHaveBeenCalledWith(
      "Password1!",
      "hashed-password",
    );
    expect(mocks.createSession).toHaveBeenCalledWith("user_123", true);
    expect(mocks.clearFailedLoginAttempts).toHaveBeenCalledWith(
      "user@example.com",
      expect.stringMatching(/^[a-f0-9]{64}$/),
    );
  });
});
