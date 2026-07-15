import { describe, expect, it } from "vitest";
import { formatDashboardUser, profileNameSchema } from "./user";

describe("formatDashboardUser", () => {
  it("shows only the first name, email, and avatar initial in the dashboard topbar", () => {
    expect(
      formatDashboardUser({
        firstName: "Toko",
        lastName: "Michael",
        email: "michael2020@email.com",
      }),
    ).toEqual({
      name: "Toko",
      email: "michael2020@email.com",
      initial: "T",
    });
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
