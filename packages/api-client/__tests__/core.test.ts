import { afterEach, describe, expect, it, vi } from "vitest";
import { parseJson } from "../core/parse-json";
import { createRequest } from "../core/request";

describe("parseJson", () => {
  it("returns unexpected payload error when response is not ok but payload is ok", async () => {
    const response = new Response(JSON.stringify({ ok: true }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

    await expect(parseJson(response)).resolves.toEqual({
      ok: false,
      error: "Unexpected response payload.",
    });
  });
});

describe("createRequest", () => {
  const ORIGINAL_NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    vi.restoreAllMocks();
    if (ORIGINAL_NEXT_PUBLIC_API_URL === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = ORIGINAL_NEXT_PUBLIC_API_URL;
    }
  });

  it("uses env base url, includes credentials and keeps explicit content-type", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://env.example";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: { id: "run-1" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const request = createRequest({
      headers: { Authorization: "Bearer token" },
      credentials: "omit",
    });

    await request("/api/test", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "raw body",
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    const headers = new Headers(init?.headers);

    expect(url).toBe("http://env.example/api/test");
    expect(init?.credentials).toBe("omit");
    expect(headers.get("authorization")).toBe("Bearer token");
    expect(headers.get("content-type")).toBe("text/plain");
  });

  it("defaults credentials to include and auto sets content-type for body", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const request = createRequest({ baseUrl: "http://base.example" });
    await request("/api/test", {
      method: "POST",
      body: JSON.stringify({ ok: true }),
    });

    const [, init] = fetchMock.mock.calls[0] ?? [];
    const headers = new Headers(init?.headers);
    expect(init?.credentials).toBe("include");
    expect(headers.get("content-type")).toBe("application/json");
  });
});
