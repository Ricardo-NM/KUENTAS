import { describe, expect, it } from "vitest";
import {
  hashAccountDeletionOtp,
  isAccountDeletionOtpExpired,
} from "./account-deletion";

describe("account deletion helpers", () => {
  it("hashes OTP codes without storing the raw code", () => {
    const first = hashAccountDeletionOtp("123456");
    const second = hashAccountDeletionOtp("123 456");

    expect(first).toBe(second);
    expect(first).not.toBe("123456");
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it("detects expired account deletion OTP challenges", () => {
    const now = new Date("2030-01-01T00:00:00.000Z");

    expect(
      isAccountDeletionOtpExpired(new Date(now.getTime() - 1), now),
    ).toBe(true);
    expect(
      isAccountDeletionOtpExpired(new Date(now.getTime() + 1), now),
    ).toBe(false);
  });
});
