import { describe, expect, it } from "vitest";
import {
  failedLoginBlockMs,
  maxFailedLoginAttempts,
  getClientIpFromHeaders,
  getLoginRateLimitTargets,
  getNextFailedLoginState,
  getPasswordRecoveryRateLimitTargets,
  hashClientIp,
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

  it("extracts the first forwarded IP from request headers", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 198.51.100.2",
    });

    expect(getClientIpFromHeaders(headers)).toBe("203.0.113.10");
  });

  it("hashes client IP addresses before persistence", () => {
    const first = hashClientIp("203.0.113.10");
    const second = hashClientIp("203.0.113.10");

    expect(first).toBe(second);
    expect(first).not.toBe("203.0.113.10");
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it("builds rate limit targets for email, IP, and email plus IP", () => {
    expect(getLoginRateLimitTargets("user@example.com", "iphash")).toEqual([
      {
        key: "login:email:user@example.com",
        email: "user@example.com",
        ipHash: null,
        scope: "email",
      },
      {
        key: "login:ip:iphash",
        email: null,
        ipHash: "iphash",
        scope: "ip",
      },
      {
        key: "login:email-ip:user@example.com:iphash",
        email: "user@example.com",
        ipHash: "iphash",
        scope: "email_ip",
      },
    ]);
  });

  it("builds password recovery cooldown targets for email, IP, and email plus IP", () => {
    expect(
      getPasswordRecoveryRateLimitTargets("user@example.com", "iphash"),
    ).toEqual([
      {
        key: "password-reset:email:user@example.com",
        email: "user@example.com",
        ipHash: null,
        scope: "password_reset_email",
      },
      {
        key: "password-reset:ip:iphash",
        email: null,
        ipHash: "iphash",
        scope: "password_reset_ip",
      },
      {
        key: "password-reset:email-ip:user@example.com:iphash",
        email: "user@example.com",
        ipHash: "iphash",
        scope: "password_reset_email_ip",
      },
    ]);
  });
});
