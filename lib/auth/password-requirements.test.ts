import { describe, expect, it } from "vitest";
import {
  getPasswordRequirements,
  shouldShowPasswordMismatch,
} from "./password-requirements";

describe("getPasswordRequirements", () => {
  it("returns the same five frontend password rules used by auth forms", () => {
    const requirements = getPasswordRequirements("Password1!");

    expect(requirements).toEqual([
      { label: "Al menos una letra mayúscula", isMet: true },
      { label: "Al menos un número", isMet: true },
      { label: "Al menos 8 caracteres", isMet: true },
      { label: "Al menos un carácter especial", isMet: true },
      { label: "Sin espacios", isMet: true },
    ]);
  });

  it("marks unmet rules as false", () => {
    const requirements = getPasswordRequirements("password");

    expect(requirements.map((requirement) => requirement.isMet)).toEqual([
      false,
      false,
      true,
      false,
      true,
    ]);
  });

  it("shows password mismatch only after the repeated password has content", () => {
    expect(shouldShowPasswordMismatch("Password1!", "")).toBe(false);
    expect(shouldShowPasswordMismatch("Password1!", "Password1")).toBe(true);
    expect(shouldShowPasswordMismatch("Password1!", "Password1!")).toBe(false);
  });
});
