import { describe, expect, it } from "vitest";
import {
  registerSuccessMessage,
  registerSuccessRedirectDelayMs,
} from "./registration-feedback";

describe("registration feedback", () => {
  it("uses the requested success message and redirect delay", () => {
    expect(registerSuccessMessage).toBe(
      "Cuenta creada correctamente, inicia sesión",
    );
    expect(registerSuccessRedirectDelayMs).toBe(2000);
  });
});
