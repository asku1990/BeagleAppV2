import { afterEach, describe, expect, it } from "vitest";
import { jsonResponse, optionsResponse } from "../cors";

const ORIGINAL_CORS_ORIGIN = process.env.CORS_ORIGIN;
const ORIGINAL_CORS_ORIGINS = process.env.CORS_ORIGINS;

describe("cors responses", () => {
  afterEach(() => {
    if (ORIGINAL_CORS_ORIGIN === undefined) {
      delete process.env.CORS_ORIGIN;
    } else {
      process.env.CORS_ORIGIN = ORIGINAL_CORS_ORIGIN;
    }

    if (ORIGINAL_CORS_ORIGINS === undefined) {
      delete process.env.CORS_ORIGINS;
    } else {
      process.env.CORS_ORIGINS = ORIGINAL_CORS_ORIGINS;
    }
  });

  it("returns CORS headers for allowed origin from allowlist", () => {
    process.env.CORS_ORIGINS = "http://localhost:3000,http://admin.local";

    const response = jsonResponse(
      { ok: true },
      { methods: "GET,OPTIONS", origin: "http://admin.local" },
    );

    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://admin.local",
    );
    expect(response.headers.get("access-control-allow-credentials")).toBe(
      "true",
    );
  });

  it("does not return credentialed CORS headers for disallowed origin", () => {
    process.env.CORS_ORIGINS = "http://localhost:3000";

    const response = optionsResponse("GET,OPTIONS", {
      origin: "http://evil.local",
    });

    expect(response.headers.get("access-control-allow-origin")).toBeNull();
    expect(response.headers.get("access-control-allow-credentials")).toBeNull();
    expect(response.headers.get("access-control-allow-methods")).toBe(
      "GET,OPTIONS",
    );
  });
});
