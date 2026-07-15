import { describe, expect, it } from "vitest";
import {
  getLanguageOptions,
  languageSwitcherButtonContentOrder,
  languageSwitcherIconAnimationArea,
} from "./language-switcher";

describe("language switcher", () => {
  it("offers Spanish and English in the expected order", () => {
    expect(getLanguageOptions()).toEqual([
      { language: "es", labelKey: "language.spanish" },
      { language: "en", labelKey: "language.english" },
    ]);
  });

  it("places the icon before the text and animates it from the button only", () => {
    expect(languageSwitcherButtonContentOrder).toEqual(["icon", "label"]);
    expect(languageSwitcherIconAnimationArea).toBe("button");
  });
});
