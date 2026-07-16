import { describe, expect, it } from "vitest";
import {
  formatDashboardUser,
  maskEmailForDisplay,
  profileNameSchema,
} from "./user";

describe("formatDashboardUser", () => {
  it("shows only the first name, email, and avatar initial in the dashboard topbar", () => {
    expect(
      formatDashboardUser({
        firstName: "Toko",
        lastName: "Michael",
        email: "michael2020@email.com",
        profileImagePath: "/images/profile/user_123.png?v=1",
      }),
    ).toEqual({
      name: "Toko",
      email: "mi***@email.com",
      initial: "T",
      profileImagePath: "/images/profile/user_123.png?v=1",
    });
  });
});

describe("maskEmailForDisplay", () => {
  it("keeps the first two local characters and the full domain", () => {
    expect(maskEmailForDisplay("michael2020@email.com")).toBe(
      "mi***@email.com",
    );
  });

  it("leaves malformed email values untouched", () => {
    expect(maskEmailForDisplay("not-an-email")).toBe("not-an-email");
  });
});

describe("profileNameSchema", () => {
  it("keeps only editable first and last names for profile updates", () => {
    expect(
      profileNameSchema.parse({
        firstName: " Alex ",
        lastName: " Rivera Soto ",
        email: "changed@example.com",
      }),
    ).toEqual({
      firstName: "Alex",
      lastName: "Rivera Soto",
    });
  });
});
