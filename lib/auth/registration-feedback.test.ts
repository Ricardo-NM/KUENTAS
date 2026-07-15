import { describe, expect, it } from "vitest";
import {
  registerSuccessMessage,
  registerSuccessMessageKey,
  registerSuccessRedirectDelayMs,
} from "./registration-feedback";

describe("registration feedback", () => {
  it("uses the requested success message key and redirect delay", () => {
    expect(registerSuccessMessage).toBe(
      "Cuenta creada correctamente, inicia sesión",
    );
    expect(registerSuccessMessageKey).toBe("registration.success");
    expect(registerSuccessRedirectDelayMs).toBe(2000);
  });
});
