import { describe, expect, it } from "vitest";
import {
  failedLoginBlockMs,
  maxFailedLoginAttempts,
  getNextFailedLoginState,
  isBlockedLoginAttempt,
} from "./rate-limit";

describe("login rate limit", () => {
  it("blocks the fifth failed login attempt", () => {
    const now = new Date("2030-01-01T00:00:00.000Z");
    const result = getNextFailedLoginState(
      {
        failedCount: maxFailedLoginAttempts - 1,
        blockedUntil: null,
      },
      now,
    );

    expect(result.failedCount).toBe(maxFailedLoginAttempts);
    expect(result.blockedUntil?.getTime()).toBe(
      now.getTime() + failedLoginBlockMs,
    );
  });

  it("keeps attempts unblocked before the fifth failed login", () => {
    const now = new Date("2030-01-01T00:00:00.000Z");
    const result = getNextFailedLoginState(
      {
        failedCount: 3,
        blockedUntil: null,
      },
      now,
    );

    expect(result).toEqual({
      failedCount: 4,
      blockedUntil: null,
    });
  });

  it("treats future blockedUntil values as blocked", () => {
    const now = new Date("2030-01-01T00:00:00.000Z");

    expect(
      isBlockedLoginAttempt(
        {
          blockedUntil: new Date(now.getTime() + 1000),
        },
        now,
      ),
    ).toBe(true);
  });

  it("treats expired blockedUntil values as unblocked", () => {
    const now = new Date("2030-01-01T00:00:00.000Z");

    expect(
      isBlockedLoginAttempt(
        {
          blockedUntil: new Date(now.getTime() - 1000),
        },
        now,
      ),
    ).toBe(false);
  });
});
