import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cancelAccountDeletionAction,
  cancelPasswordChangeAction,
  confirmAccountDeletionAction,
  confirmPasswordChangeAction,
  completePasswordChangeSessionAction,
  requestAccountDeletionCodeAction,
  requestPasswordChangeCodeAction,
  revokeOtherSessionsAction,
  revokeSessionAction,
  updateUserProfileAction,
} from "./actions";

const mocks = vi.hoisted(() => ({
  cancelAccountDeletionOtp: vi.fn(),
  cancelPasswordChangeOtp: vi.fn(),
  createAccountDeletionOtp: vi.fn(),
  createPasswordChangeOtp: vi.fn(),
  destroyCurrentSession: vi.fn(),
  hashPassword: vi.fn(),
  redirect: vi.fn(),
  requireSession: vi.fn(),
  revalidatePath: vi.fn(),
  sessionDeleteMany: vi.fn(),
  sendAccountDeletionCodeEmail: vi.fn(),
  sendPasswordChangeCodeEmail: vi.fn(),
  userDelete: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
  verifyAccountDeletionOtp: vi.fn(),
  verifyPasswordChangeOtp: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/lib/auth/session", () => ({
  destroyCurrentSession: mocks.destroyCurrentSession,
  requireSession: mocks.requireSession,
}));

vi.mock("@/lib/auth/account-deletion", () => ({
  cancelAccountDeletionOtp: mocks.cancelAccountDeletionOtp,
  createAccountDeletionOtp: mocks.createAccountDeletionOtp,
  verifyAccountDeletionOtp: mocks.verifyAccountDeletionOtp,
}));

vi.mock("@/lib/auth/account-deletion-email", () => ({
  sendAccountDeletionCodeEmail: mocks.sendAccountDeletionCodeEmail,
}));

vi.mock("@/lib/auth/password-change", () => ({
  cancelPasswordChangeOtp: mocks.cancelPasswordChangeOtp,
  createPasswordChangeOtp: mocks.createPasswordChangeOtp,
  verifyPasswordChangeOtp: mocks.verifyPasswordChangeOtp,
}));

vi.mock("@/lib/auth/password-change-email", () => ({
  sendPasswordChangeCodeEmail: mocks.sendPasswordChangeCodeEmail,
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: mocks.hashPassword,
  verifyPassword: mocks.verifyPassword,
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    session: {
      deleteMany: mocks.sessionDeleteMany,
    },
    user: {
      delete: mocks.userDelete,
      findUnique: mocks.userFindUnique,
      update: mocks.userUpdate,
    },
  }),
}));

function formData(input: Record<string, string>) {
  const data = new FormData();

  for (const [key, value] of Object.entries(input)) {
    data.set(key, value);
  }

  return data;
}

describe("configuration profile actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireSession.mockResolvedValue({
      sessionId: "session_current",
      userId: "user_123",
    });
    mocks.sessionDeleteMany.mockResolvedValue({ count: 1 });
    mocks.userDelete.mockResolvedValue({ id: "user_123" });
    mocks.userFindUnique.mockResolvedValue({
      id: "user_123",
      email: "alex@example.com",
      passwordHash: "hashed-password",
    });
    mocks.userUpdate.mockResolvedValue({
      firstName: "Alex",
      lastName: "Rivera Soto",
      email: "alex@example.com",
    });
    mocks.verifyPassword.mockResolvedValue(true);
    mocks.hashPassword.mockResolvedValue("new-hashed-password");
    mocks.createAccountDeletionOtp.mockResolvedValue({
      id: "delete_otp_123",
      code: "123456",
      expiresAt: new Date("2030-01-01T00:10:00.000Z"),
    });
    mocks.createPasswordChangeOtp.mockResolvedValue({
      id: "password_change_otp_123",
      code: "654321",
      expiresAt: new Date("2030-01-01T00:10:00.000Z"),
    });
    mocks.sendAccountDeletionCodeEmail.mockResolvedValue(undefined);
    mocks.sendPasswordChangeCodeEmail.mockResolvedValue(undefined);
    mocks.cancelAccountDeletionOtp.mockResolvedValue(undefined);
    mocks.cancelPasswordChangeOtp.mockResolvedValue(undefined);
    mocks.verifyAccountDeletionOtp.mockResolvedValue({
      id: "delete_otp_123",
      tokenHash: "hash",
      expiresAt: new Date("2030-01-01T00:10:00.000Z"),
    });
    mocks.verifyPasswordChangeOtp.mockResolvedValue({
      id: "password_change_otp_123",
      expiresAt: new Date("2030-01-01T00:10:00.000Z"),
      usedAt: new Date("2030-01-01T00:02:00.000Z"),
    });
    mocks.destroyCurrentSession.mockResolvedValue(undefined);
    mocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("updates only the authenticated user's editable profile names", async () => {
    const result = await updateUserProfileAction(
      undefined,
      formData({
        firstName: "  Alex  ",
        lastName: "  Rivera Soto ",
        email: "changed@example.com",
      }),
    );

    expect(result).toEqual({
      status: "success",
      successId: expect.any(String),
      values: {
        firstName: "Alex",
        lastName: "Rivera Soto",
      },
      messageKey: "dashboard.settings.profile.feedback.saved",
    });
    expect(mocks.requireSession).toHaveBeenCalled();
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: {
        id: "user_123",
      },
      data: {
        firstName: "Alex",
        lastName: "Rivera Soto",
      },
      select: {
        firstName: true,
        lastName: true,
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/configuracion");
  });

  it("does not update the user when editable names are empty", async () => {
    const result = await updateUserProfileAction(
      undefined,
      formData({
        firstName: "",
        lastName: "   ",
      }),
    );

    expect(result.status).toBe("error");
    expect(result.errors?.firstName).toBeDefined();
    expect(result.errors?.lastName).toBeDefined();
    expect(mocks.userUpdate).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("revokes one non-current session that belongs to the authenticated user", async () => {
    const result = await revokeSessionAction("session_other");

    expect(result).toEqual({
      status: "success",
      messageKey: "dashboard.settings.security.recentActivity.feedback.closed",
    });
    expect(mocks.sessionDeleteMany).toHaveBeenCalledWith({
      where: {
        id: "session_other",
        userId: "user_123",
        NOT: {
          id: "session_current",
        },
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/configuracion");
  });

  it("does not revoke the current session through the one-session action", async () => {
    const result = await revokeSessionAction("session_current");

    expect(result).toEqual({
      status: "error",
      messageKey:
        "dashboard.settings.security.recentActivity.feedback.currentSession",
    });
    expect(mocks.sessionDeleteMany).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("revokes all other sessions while keeping the current session", async () => {
    mocks.sessionDeleteMany.mockResolvedValue({ count: 3 });

    const result = await revokeOtherSessionsAction();

    expect(result).toEqual({
      status: "success",
      messageKey:
        "dashboard.settings.security.recentActivity.feedback.closedAll",
      revokedCount: 3,
    });
    expect(mocks.sessionDeleteMany).toHaveBeenCalledWith({
      where: {
        userId: "user_123",
        NOT: {
          id: "session_current",
        },
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/configuracion");
  });

  it("emails a password change OTP after validating the current and new passwords", async () => {
    const result = await requestPasswordChangeCodeAction(
      formData({
        currentPassword: "Password1!",
        newPassword: "Password2!",
        confirmPassword: "Password2!",
        language: "es",
      }),
    );

    expect(result).toEqual({
      status: "success",
      maskedEmail: "al**@example.com",
    });
    expect(mocks.verifyPassword).toHaveBeenCalledWith(
      "Password1!",
      "hashed-password",
    );
    expect(mocks.createPasswordChangeOtp).toHaveBeenCalledWith("user_123");
    expect(mocks.sendPasswordChangeCodeEmail).toHaveBeenCalledWith({
      to: "alex@example.com",
      code: "654321",
      expiresAt: new Date("2030-01-01T00:10:00.000Z"),
      language: "es",
    });
  });

  it("rejects password change requests when the current password is invalid", async () => {
    mocks.verifyPassword.mockResolvedValue(false);

    const result = await requestPasswordChangeCodeAction(
      formData({
        currentPassword: "wrong-password",
        newPassword: "Password2!",
        confirmPassword: "Password2!",
      }),
    );

    expect(result).toEqual({
      status: "error",
      messageKey:
        "dashboard.settings.security.password.feedback.invalidCurrent",
      errors: {
        currentPassword:
          "dashboard.settings.security.password.feedback.invalidCurrent",
      },
    });
    expect(mocks.createPasswordChangeOtp).not.toHaveBeenCalled();
    expect(mocks.sendPasswordChangeCodeEmail).not.toHaveBeenCalled();
  });

  it("invalidates a pending password change OTP when email delivery fails", async () => {
    mocks.sendPasswordChangeCodeEmail.mockRejectedValue(
      new Error("smtp unavailable"),
    );

    const result = await requestPasswordChangeCodeAction(
      formData({
        currentPassword: "Password1!",
        newPassword: "Password2!",
        confirmPassword: "Password2!",
      }),
    );

    expect(result).toEqual({
      status: "error",
      messageKey:
        "dashboard.settings.security.password.feedback.emailSendFailed",
    });
    expect(mocks.cancelPasswordChangeOtp).toHaveBeenCalledWith("user_123");
  });

  it("cancels a pending password change code for the current user", async () => {
    const result = await cancelPasswordChangeAction();

    expect(result).toEqual({
      status: "success",
    });
    expect(mocks.cancelPasswordChangeOtp).toHaveBeenCalledWith("user_123");
  });

  it("does not change the password when the password change OTP is invalid", async () => {
    mocks.verifyPasswordChangeOtp.mockResolvedValue(null);

    const result = await confirmPasswordChangeAction(
      formData({
        code: "654321",
        newPassword: "Password2!",
        confirmPassword: "Password2!",
      }),
    );

    expect(result).toEqual({
      status: "error",
      messageKey: "dashboard.settings.security.password.feedback.invalidCode",
      errors: {
        code: "dashboard.settings.security.password.feedback.invalidCode",
      },
    });
    expect(mocks.userUpdate).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          passwordHash: expect.any(String),
        },
      }),
    );
  });

  it("updates the password after a valid password change OTP", async () => {
    const result = await confirmPasswordChangeAction(
      formData({
        code: "654321",
        newPassword: "Password2!",
        confirmPassword: "Password2!",
      }),
    );

    expect(result).toEqual({
      status: "success",
      messageKey: "dashboard.settings.security.password.feedback.changed",
    });
    expect(mocks.verifyPasswordChangeOtp).toHaveBeenCalledWith(
      "user_123",
      "654321",
    );
    expect(mocks.hashPassword).toHaveBeenCalledWith("Password2!");
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: {
        id: "user_123",
      },
      data: {
        passwordHash: "new-hashed-password",
      },
      select: {
        id: true,
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/configuracion");
  });

  it("closes only the current session after a password change", async () => {
    await expect(
      completePasswordChangeSessionAction("current"),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.sessionDeleteMany).not.toHaveBeenCalled();
    expect(mocks.destroyCurrentSession).toHaveBeenCalled();
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });

  it("closes every session after a password change when requested", async () => {
    await expect(completePasswordChangeSessionAction("all")).rejects.toThrow(
      "NEXT_REDIRECT",
    );

    expect(mocks.sessionDeleteMany).toHaveBeenCalledWith({
      where: {
        userId: "user_123",
      },
    });
    expect(mocks.destroyCurrentSession).toHaveBeenCalled();
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });

  it("requires the current password before sending an account deletion code", async () => {
    const result = await requestAccountDeletionCodeAction(
      formData({
        password: "",
      }),
    );

    expect(result).toEqual({
      status: "error",
      messageKey:
        "dashboard.settings.security.dangerZone.confirm.passwordRequired",
    });
    expect(mocks.requireSession).not.toHaveBeenCalled();
    expect(mocks.createAccountDeletionOtp).not.toHaveBeenCalled();
    expect(mocks.sendAccountDeletionCodeEmail).not.toHaveBeenCalled();
  });

  it("rejects account deletion when the password is invalid", async () => {
    mocks.verifyPassword.mockResolvedValue(false);

    const result = await requestAccountDeletionCodeAction(
      formData({
        password: "wrong-password",
      }),
    );

    expect(result).toEqual({
      status: "error",
      messageKey:
        "dashboard.settings.security.dangerZone.confirm.invalidPassword",
    });
    expect(mocks.verifyPassword).toHaveBeenCalledWith(
      "wrong-password",
      "hashed-password",
    );
    expect(mocks.createAccountDeletionOtp).not.toHaveBeenCalled();
    expect(mocks.sendAccountDeletionCodeEmail).not.toHaveBeenCalled();
  });

  it("emails an account deletion OTP after validating the password", async () => {
    const result = await requestAccountDeletionCodeAction(
      formData({
        password: "Password1!",
        language: "es",
      }),
    );

    expect(result).toEqual({
      status: "success",
      maskedEmail: "al**@example.com",
    });
    expect(mocks.createAccountDeletionOtp).toHaveBeenCalledWith("user_123");
    expect(mocks.sendAccountDeletionCodeEmail).toHaveBeenCalledWith({
      to: "alex@example.com",
      code: "123456",
      expiresAt: new Date("2030-01-01T00:10:00.000Z"),
      language: "es",
    });
  });

  it("invalidates the pending account deletion OTP when email delivery fails", async () => {
    mocks.sendAccountDeletionCodeEmail.mockRejectedValue(
      new Error("smtp unavailable"),
    );

    const result = await requestAccountDeletionCodeAction(
      formData({
        password: "Password1!",
      }),
    );

    expect(result).toEqual({
      status: "error",
      messageKey:
        "dashboard.settings.security.dangerZone.confirm.emailSendFailed",
    });
    expect(mocks.cancelAccountDeletionOtp).toHaveBeenCalledWith("user_123");
  });

  it("cancels a pending account deletion code for the current user", async () => {
    const result = await cancelAccountDeletionAction();

    expect(result).toEqual({
      status: "success",
    });
    expect(mocks.cancelAccountDeletionOtp).toHaveBeenCalledWith("user_123");
  });

  it("does not delete the account when the deletion OTP is invalid", async () => {
    mocks.verifyAccountDeletionOtp.mockResolvedValue(null);

    const result = await confirmAccountDeletionAction(
      formData({
        code: "123456",
      }),
    );

    expect(result).toEqual({
      status: "error",
      messageKey:
        "dashboard.settings.security.dangerZone.confirm.invalidCode",
    });
    expect(mocks.userDelete).not.toHaveBeenCalled();
    expect(mocks.destroyCurrentSession).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("deletes the user, clears the session, and redirects after a valid deletion OTP", async () => {
    await expect(
      confirmAccountDeletionAction(
        formData({
          code: "123456",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.verifyAccountDeletionOtp).toHaveBeenCalledWith(
      "user_123",
      "123456",
    );
    expect(mocks.userDelete).toHaveBeenCalledWith({
      where: {
        id: "user_123",
      },
    });
    expect(mocks.destroyCurrentSession).toHaveBeenCalled();
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });
});
