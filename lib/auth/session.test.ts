import { describe, expect, it } from "vitest";
import {
  buildSessionCookieValue,
  hashSessionToken,
  parseSessionCookieValue,
} from "./session";

describe("session token helpers", () => {
  it("builds and parses opaque session cookie values", () => {
    const cookieValue = buildSessionCookieValue("session_123", "token_456");

    expect(cookieValue).toBe("session_123.token_456");
    expect(parseSessionCookieValue(cookieValue)).toEqual({
      sessionId: "session_123",
      token: "token_456",
    });
  });

  it("rejects malformed session cookie values", () => {
    expect(parseSessionCookieValue("missing-token")).toBeNull();
    expect(parseSessionCookieValue("too.many.parts")).toBeNull();
    expect(parseSessionCookieValue(".token")).toBeNull();
    expect(parseSessionCookieValue("session.")).toBeNull();
  });

  it("hashes session tokens deterministically without returning the raw token", () => {
    const first = hashSessionToken("token_456");
    const second = hashSessionToken("token_456");

    expect(first).toBe(second);
    expect(first).not.toBe("token_456");
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });
});
