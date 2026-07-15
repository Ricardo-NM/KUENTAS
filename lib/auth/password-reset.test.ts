import { describe, expect, it } from "vitest";
import {
  createPasswordResetSessionValue,
  hashPasswordResetOtp,
  isPasswordResetOtpExpired,
  parsePasswordResetSessionValue,
} from "./password-reset";

describe("password reset helpers", () => {
  it("hashes OTP codes without storing the raw code", () => {
    const first = hashPasswordResetOtp("123456");
    const second = hashPasswordResetOtp("123 456");

    expect(first).toBe(second);
    expect(first).not.toBe("123456");
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it("signs and parses password reset session payloads", () => {
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    const value = createPasswordResetSessionValue({
      id: "reset_123",
      userId: "user_123",
      expiresAt,
    });

    expect(parsePasswordResetSessionValue(value)).toEqual({
      id: "reset_123",
      userId: "user_123",
      expiresAt: new Date(expiresAt),
    });
  });

  it("rejects tampered password reset session payloads", () => {
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    const value = createPasswordResetSessionValue({
      id: "reset_123",
      userId: "user_123",
      expiresAt,
    });

    expect(parsePasswordResetSessionValue(`${value}x`)).toBeNull();
  });

  it("detects expired OTP challenges", () => {
    const now = new Date("2030-01-01T00:00:00.000Z");

    expect(isPasswordResetOtpExpired(new Date(now.getTime() - 1), now)).toBe(
      true,
    );
    expect(isPasswordResetOtpExpired(new Date(now.getTime() + 1), now)).toBe(
      false,
    );
  });
});
