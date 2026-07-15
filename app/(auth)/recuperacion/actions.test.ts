import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  requestPasswordResetAction,
  resetPasswordAction,
} from "./actions";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
  sessionDeleteMany: vi.fn(),
  passwordResetTokenUpdate: vi.fn(),
  transaction: vi.fn(),
  createPasswordResetToken: vi.fn(),
  verifyPasswordResetToken: vi.fn(),
  hashPassword: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/headers", () => ({
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

vi.mock("@/lib/auth/password-reset", () => ({
  buildPasswordResetUrl: (origin: string, token: string) =>
    `${origin}/recuperacion?token=${token}`,
  createPasswordResetToken: mocks.createPasswordResetToken,
  verifyPasswordResetToken: mocks.verifyPasswordResetToken,
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
    mocks.headers.mockResolvedValue(
      new Headers({
        host: "localhost:3000",
        "x-forwarded-proto": "http",
      }),
    );
    mocks.createPasswordResetToken.mockResolvedValue({
      token: "raw-token",
      expiresAt: new Date("2030-01-01T00:30:00.000Z"),
    });
    mocks.hashPassword.mockResolvedValue("new-hashed-password");
    mocks.transaction.mockResolvedValue([]);
  });

  it("returns a generic success message when requesting reset for an unknown email", async () => {
    mocks.userFindUnique.mockResolvedValue(null);

    const result = await requestPasswordResetAction(
      undefined,
      formData({
        email: "missing@example.com",
      }),
    );

    expect(result.status).toBe("success");
    expect(result.message).toContain("Si el correo existe");
    expect(result.messageKey).toBe("validation.resetRequestSuccess");
    expect(mocks.createPasswordResetToken).not.toHaveBeenCalled();
  });

  it("creates a reset token for an existing user", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "user_123",
      email: "user@example.com",
    });

    const result = await requestPasswordResetAction(
      undefined,
      formData({
        email: "USER@example.com",
      }),
    );

    expect(result.status).toBe("success");
    expect(result.messageKey).toBe("validation.resetRequestSuccess");
    expect(mocks.createPasswordResetToken).toHaveBeenCalledWith("user_123");
    expect(result.devResetUrl).toBe(
      process.env.NODE_ENV === "production"
        ? undefined
        : "http://localhost:3000/recuperacion?token=raw-token",
    );
  });

  it("resets password with a valid token, clears sessions, and redirects to login", async () => {
    mocks.verifyPasswordResetToken.mockResolvedValue({
      id: "token_123",
      userId: "user_123",
    });

    await resetPasswordAction(
      undefined,
      formData({
        token: "raw-token",
        password: "Password1!",
        repeatPassword: "Password1!",
      }),
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
        id: "token_123",
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
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });
});
