import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("hashes passwords without storing the original value", async () => {
    const hash = await hashPassword("Password1!");

    expect(hash).not.toBe("Password1!");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifies the matching password and rejects a different password", async () => {
    const hash = await hashPassword("Password1!");

    await expect(verifyPassword("Password1!", hash)).resolves.toBe(true);
    await expect(verifyPassword("Password2!", hash)).resolves.toBe(false);
  });
});
