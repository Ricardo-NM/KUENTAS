import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  revokeOtherSessionsAction,
  revokeSessionAction,
  updateUserProfileAction,
} from "./actions";

const mocks = vi.hoisted(() => ({
  requireSession: vi.fn(),
  revalidatePath: vi.fn(),
  sessionDeleteMany: vi.fn(),
  userUpdate: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/auth/session", () => ({
  requireSession: mocks.requireSession,
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    session: {
      deleteMany: mocks.sessionDeleteMany,
    },
    user: {
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
    mocks.userUpdate.mockResolvedValue({
      firstName: "Alex",
      lastName: "Rivera Soto",
      email: "alex@example.com",
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
});
