import { afterEach, describe, expect, it, vi } from "vitest";
import { createApiClient } from "./index";

describe("api client request headers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not set content-type for requests without a body", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: { info: "ok" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createApiClient({ baseUrl: "http://example.test" });

    await client.getImportStatus();

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);
    expect(headers.has("Content-Type")).toBe(false);
  });

  it("sets content-type for requests with a JSON body", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: { id: "1" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createApiClient({ baseUrl: "http://example.test" });

    await client.register({
      email: "user@example.com",
      password: "secret",
    });

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);
    expect(headers.get("Content-Type")).toBe("application/json");
  });
});
