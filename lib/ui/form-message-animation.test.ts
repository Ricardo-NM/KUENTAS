import { describe, expect, it } from "vitest";
import { formMessageAnimationMs } from "./form-message-animation";

describe("form message animation", () => {
  it("uses a smooth fade and collapse duration", () => {
    expect(formMessageAnimationMs).toBe(260);
  });
});
