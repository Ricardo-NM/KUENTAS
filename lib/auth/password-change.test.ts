import { describe, expect, it } from "vitest";
import {
  hashPasswordChangeOtp,
  isPasswordChangeOtpExpired,
} from "./password-change";

describe("password change helpers", () => {
  it("hashes OTP codes without storing the raw code", () => {
    const first = hashPasswordChangeOtp("123456");
    const second = hashPasswordChangeOtp("123 456");

    expect(first).toBe(second);
    expect(first).not.toBe("123456");
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it("detects expired password change OTP challenges", () => {
    const now = new Date("2030-01-01T00:00:00.000Z");

    expect(isPasswordChangeOtpExpired(new Date(now.getTime() - 1), now)).toBe(
      true,
    );
    expect(isPasswordChangeOtpExpired(new Date(now.getTime() + 1), now)).toBe(
      false,
    );
  });
});
