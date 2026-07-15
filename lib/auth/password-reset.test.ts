import { describe, expect, it } from "vitest";
import {
  buildPasswordResetUrl,
  hashPasswordResetToken,
  isPasswordResetTokenExpired,
} from "./password-reset";

describe("password reset helpers", () => {
  it("hashes reset tokens without storing the raw token", () => {
    const first = hashPasswordResetToken("reset-token");
    const second = hashPasswordResetToken("reset-token");

    expect(first).toBe(second);
    expect(first).not.toBe("reset-token");
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it("builds recovery URLs with the raw token in the query string", () => {
    expect(buildPasswordResetUrl("https://kuentas.test", "abc123")).toBe(
      "https://kuentas.test/recuperacion?token=abc123",
    );
  });

  it("detects expired reset tokens", () => {
    const now = new Date("2030-01-01T00:00:00.000Z");

    expect(
      isPasswordResetTokenExpired(new Date(now.getTime() - 1), now),
    ).toBe(true);
    expect(
      isPasswordResetTokenExpired(new Date(now.getTime() + 1), now),
    ).toBe(false);
  });
});
