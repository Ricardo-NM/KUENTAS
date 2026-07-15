import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  requestPasswordResetAction,
  resetPasswordAction,
  verifyPasswordResetCodeAction,
} from "./actions";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  headers: vi.fn(),
  cookieGet: vi.fn(),
  cookieSet: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
  sessionDeleteMany: vi.fn(),
  passwordResetTokenUpdate: vi.fn(),
  transaction: vi.fn(),
  createPasswordResetOtp: vi.fn(),
  verifyPasswordResetOtp: vi.fn(),
  verifyPasswordResetSession: vi.fn(),
  hashPassword: vi.fn(),
  redirect: vi.fn(),
  sendPasswordResetCodeEmail: vi.fn(),
  getClientIpFromHeaders: vi.fn(),
  getPasswordRecoveryEmailCooldown: vi.fn(),
  hashClientIp: vi.fn(),
  recordPasswordRecoveryEmailAttempt: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
  headers: mocks.headers,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    user: {
      findUnique: mocks.userFindUnique,
      update: mocks.userUpdate,
    },
    session: {
      deleteMany: mocks.sessionDeleteMany,
    },
    passwordResetToken: {
      update: mocks.passwordResetTokenUpdate,
    },
    $transaction: mocks.transaction,
  }),
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: mocks.hashPassword,
}));

vi.mock("@/lib/auth/rate-limit", () => ({
  getClientIpFromHeaders: mocks.getClientIpFromHeaders,
  getPasswordRecoveryEmailCooldown: mocks.getPasswordRecoveryEmailCooldown,
  hashClientIp: mocks.hashClientIp,
  recordPasswordRecoveryEmailAttempt: mocks.recordPasswordRecoveryEmailAttempt,
}));

vi.mock("@/lib/auth/password-reset", () => ({
  createPasswordResetOtp: mocks.createPasswordResetOtp,
  createPasswordResetSessionValue: () => "signed-reset-session",
  passwordResetSessionCookieName: "kuentas_password_reset",
  verifyPasswordResetOtp: mocks.verifyPasswordResetOtp,
  verifyPasswordResetSession: mocks.verifyPasswordResetSession,
}));

vi.mock("@/lib/auth/password-reset-email", () => ({
  sendPasswordResetCodeEmail: mocks.sendPasswordResetCodeEmail,
}));

function formData(input: Record<string, string>) {
  const data = new FormData();

  for (const [key, value] of Object.entries(input)) {
    data.set(key, value);
  }

  return data;
}

describe("password recovery actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.mockResolvedValue({
      get: mocks.cookieGet,
      set: mocks.cookieSet,
    });
    mocks.headers.mockResolvedValue(new Headers());
    mocks.getClientIpFromHeaders.mockReturnValue("203.0.113.10");
    mocks.hashClientIp.mockReturnValue("iphash");
    mocks.getPasswordRecoveryEmailCooldown.mockResolvedValue(null);
    mocks.recordPasswordRecoveryEmailAttempt.mockResolvedValue(
      new Date("2030-01-01T00:01:00.000Z"),
    );
    mocks.createPasswordResetOtp.mockResolvedValue({
      code: "123456",
      expiresAt: new Date("2030-01-01T00:10:00.000Z"),
    });
    mocks.hashPassword.mockResolvedValue("new-hashed-password");
    mocks.transaction.mockResolvedValue([]);
    mocks.sendPasswordResetCodeEmail.mockResolvedValue(undefined);
    mocks.cookieGet.mockReturnValue({
      value: "signed-reset-session",
    });
  });

  it("shows a generic notice and stays on request step for an unknown email", async () => {
    mocks.userFindUnique.mockResolvedValue(null);

    const result = await requestPasswordResetAction(
      undefined,
      formData({
        email: "missing@example.com",
      }),
    );

    expect(result).toMatchObject({
      status: "success",
      step: "request",
      email: "missing@example.com",
      cooldownUntil: "2030-01-01T00:01:00.000Z",
      modalMessageKey: "recovery.requestNoticeBody",
    });
    expect(mocks.createPasswordResetOtp).not.toHaveBeenCalled();
    expect(mocks.sendPasswordResetCodeEmail).not.toHaveBeenCalled();
    expect(mocks.recordPasswordRecoveryEmailAttempt).toHaveBeenCalledWith(
      "missing@example.com",
      "iphash",
    );
  });

  it("creates and emails an OTP for an existing user", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "user_123",
      email: "user@example.com",
    });

    const result = await requestPasswordResetAction(
      undefined,
      formData({
        email: "USER@example.com",
        language: "en",
      }),
    );

    expect(result).toMatchObject({
      status: "success",
      step: "verify",
      email: "user@example.com",
      modalMessageKey: "recovery.codeSentMessage",
    });
    expect(mocks.createPasswordResetOtp).toHaveBeenCalledWith("user_123");
    expect(mocks.sendPasswordResetCodeEmail).toHaveBeenCalledWith({
      to: "user@example.com",
      code: "123456",
      expiresAt: new Date("2030-01-01T00:10:00.000Z"),
      language: "en",
    });
    expect(mocks.recordPasswordRecoveryEmailAttempt).toHaveBeenCalledWith(
      "user@example.com",
      "iphash",
    );
  });

  it("blocks password reset email requests during an active cooldown", async () => {
    mocks.getPasswordRecoveryEmailCooldown.mockResolvedValue(
      new Date("2030-01-01T00:01:00.000Z"),
    );

    const result = await requestPasswordResetAction(
      undefined,
      formData({
        email: "user@example.com",
      }),
    );

    expect(result).toMatchObject({
      status: "error",
      step: "request",
      email: "user@example.com",
      cooldownUntil: "2030-01-01T00:01:00.000Z",
      messageKey: "validation.resetEmailCooldown",
      modalMessageKey: "recovery.requestNoticeBody",
    });
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
    expect(mocks.sendPasswordResetCodeEmail).not.toHaveBeenCalled();
  });

  it("verifies an OTP and stores a short lived reset session cookie", async () => {
    mocks.verifyPasswordResetOtp.mockResolvedValue({
      id: "reset_123",
      userId: "user_123",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const result = await verifyPasswordResetCodeAction(
      undefined,
      formData({
        email: "user@example.com",
        code: "123456",
      }),
    );

    expect(result).toMatchObject({
      status: "success",
      step: "reset",
      email: "user@example.com",
    });
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      "kuentas_password_reset",
      "signed-reset-session",
      expect.objectContaining({
        httpOnly: true,
        path: "/recuperacion",
        sameSite: "lax",
      }),
    );
  });

  it("resets password after a valid OTP session, clears sessions, and redirects to login", async () => {
    mocks.verifyPasswordResetSession.mockResolvedValue({
      id: "reset_123",
      userId: "user_123",
    });

    await resetPasswordAction(
      undefined,
      formData({
        password: "Password1!",
        repeatPassword: "Password1!",
      }),
    );

    expect(mocks.verifyPasswordResetSession).toHaveBeenCalledWith(
      "signed-reset-session",
    );
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: {
        id: "user_123",
      },
      data: {
        passwordHash: "new-hashed-password",
      },
    });
    expect(mocks.sessionDeleteMany).toHaveBeenCalledWith({
      where: {
        userId: "user_123",
      },
    });
    expect(mocks.passwordResetTokenUpdate).toHaveBeenCalledWith({
      where: {
        id: "reset_123",
      },
      data: {
        usedAt: expect.any(Date),
      },
    });
    expect(mocks.transaction).toHaveBeenCalledWith([
      undefined,
      undefined,
      undefined,
    ]);
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      "kuentas_password_reset",
      "",
      expect.objectContaining({
        maxAge: 0,
        path: "/recuperacion",
      }),
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });
});
