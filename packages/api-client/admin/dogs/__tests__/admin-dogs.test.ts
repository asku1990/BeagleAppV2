import { afterEach, describe, expect, it, vi } from "vitest";
import { createAdminDogsApiClient } from "../create-admin-dogs-api-client";
import { listAdminDogColorOptions } from "../list-admin-dog-color-options";

describe("admin dogs api helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the color lookup endpoint", async () => {
    const requestMock = vi.fn().mockResolvedValue({ ok: true, data: {} });

    await listAdminDogColorOptions(requestMock);

    expect(requestMock).toHaveBeenCalledWith("/api/admin/dogs/lookups/colors", {
      method: "GET",
    });
  });

  it("builds the color lookup endpoint via createAdminDogsApiClient", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: { items: [] } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createAdminDogsApiClient({
      baseUrl: "http://example.test",
    });

    await client.listAdminDogColorOptions();

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("http://example.test/api/admin/dogs/lookups/colors");
    expect(init?.method).toBe("GET");
  });
});
