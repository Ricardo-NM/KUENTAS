import { describe, expect, it } from "vitest";
import {
  buildSessionCookieValue,
  getSessionDeviceLabel,
  getSessionRequestMetadata,
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

  it("builds readable device labels from user agents", () => {
    expect(
      getSessionDeviceLabel(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      ),
    ).toBe("macOS - Chrome");
    expect(
      getSessionDeviceLabel(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
      ),
    ).toBe("iPhone - Safari");
    expect(getSessionDeviceLabel(null)).toBe("Dispositivo desconocido");
  });

  it("extracts session request metadata from headers", () => {
    const headers = new Headers({
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edg/126.0.0.0 Safari/537.36",
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    });

    expect(getSessionRequestMetadata(headers)).toEqual({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edg/126.0.0.0 Safari/537.36",
      deviceLabel: "Windows - Edge",
      ipHash: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
  });
});
