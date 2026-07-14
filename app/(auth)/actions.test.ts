import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  registerAction,
  loginAction,
} from "./actions";
import { invalidCredentialsMessage } from "@/lib/auth/validation";

const mocks = vi.hoisted(() => ({
  userCreate: vi.fn(),
  userFindUnique: vi.fn(),
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
  createSession: vi.fn(),
  clearFailedLoginAttempts: vi.fn(),
  isLoginBlocked: vi.fn(),
  recordFailedLoginAttempt: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    user: {
      create: mocks.userCreate,
      findUnique: mocks.userFindUnique,
    },
  }),
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
  isLoginBlocked: mocks.isLoginBlocked,
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
    mocks.isLoginBlocked.mockResolvedValue(false);
  });

  it("does not create users when registration input is invalid", async () => {
    const result = await registerAction(undefined, formData({}));

    expect(result.status).toBe("error");
    expect(result.errors?.email).toBeDefined();
    expect(mocks.userCreate).not.toHaveBeenCalled();
  });

  it("creates users with normalized email and hashed password", async () => {
    mocks.userCreate.mockResolvedValue({ id: "user_123" });

    const result = await registerAction(
      undefined,
      formData({
        firstName: "Renato",
        lastName: "Morales",
        email: "  USER@Example.COM ",
        password: "Password1!",
        repeatPassword: "Password1!",
      }),
    );

    expect(result).toEqual({ status: "success" });
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
      },
    });
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
    });
    expect(mocks.recordFailedLoginAttempt).toHaveBeenCalledWith(
      "missing@example.com",
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
      message: invalidCredentialsMessage,
    });
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
    expect(mocks.recordFailedLoginAttempt).not.toHaveBeenCalled();
  });

  it("creates a remembered session when login succeeds", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "user_123",
      passwordHash: "hashed-password",
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
    );
  });
});
