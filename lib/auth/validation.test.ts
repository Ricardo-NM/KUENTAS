import { describe, expect, it } from "vitest";
import {
  loginSchema,
  normalizeEmail,
  registerSchema,
} from "./validation";

describe("auth validation", () => {
  it("accepts valid registration data and normalizes email", () => {
    const result = registerSchema.safeParse({
      firstName: "Renato",
      lastName: "Morales",
      email: "  USER@Example.COM ",
      password: "Password1!",
      repeatPassword: "Password1!",
    });

    expect(result.success).toBe(true);
    expect(result.success && result.data.email).toBe("user@example.com");
  });

  it("rejects registration passwords that do not match the frontend rules", () => {
    const result = registerSchema.safeParse({
      firstName: "Renato",
      lastName: "Morales",
      email: "user@example.com",
      password: "password",
      repeatPassword: "password",
    });

    expect(result.success).toBe(false);
    expect(
      !result.success &&
        result.error.issues.some((issue) => issue.path.includes("password")),
    ).toBe(true);
  });

  it("rejects registration when repeated password differs", () => {
    const result = registerSchema.safeParse({
      firstName: "Renato",
      lastName: "Morales",
      email: "user@example.com",
      password: "Password1!",
      repeatPassword: "Password2!",
    });

    expect(result.success).toBe(false);
    expect(
      !result.success &&
        result.error.issues.some((issue) =>
          issue.path.includes("repeatPassword"),
        ),
    ).toBe(true);
  });

  it("accepts valid login data and trims email", () => {
    const result = loginSchema.safeParse({
      email: "  USER@Example.COM ",
      password: "Password1!",
      remember: "on",
    });

    expect(result.success).toBe(true);
    expect(result.success && result.data).toEqual({
      email: "user@example.com",
      password: "Password1!",
      remember: true,
    });
  });

  it("normalizes email consistently", () => {
    expect(normalizeEmail("  USER@Example.COM ")).toBe("user@example.com");
  });
});
