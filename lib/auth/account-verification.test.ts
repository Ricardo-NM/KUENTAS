import { describe, expect, it } from "vitest";
import {
  hashAccountVerificationOtp,
  isAccountVerificationOtpExpired,
} from "./account-verification";

describe("account verification helpers", () => {
  it("hashes OTP codes without storing the raw code", () => {
    const first = hashAccountVerificationOtp("123456");
    const second = hashAccountVerificationOtp("123 456");

    expect(first).toBe(second);
    expect(first).not.toBe("123456");
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it("detects expired account verification OTP challenges", () => {
    const now = new Date("2030-01-01T00:00:00.000Z");

    expect(
      isAccountVerificationOtpExpired(new Date(now.getTime() - 1), now),
    ).toBe(true);
    expect(
      isAccountVerificationOtpExpired(new Date(now.getTime() + 1), now),
    ).toBe(false);
  });
});
