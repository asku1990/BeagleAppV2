import { afterEach, describe, expect, it, vi } from "vitest";
import { createAdminShowsApiClient } from "../create-admin-shows-api-client";

describe("admin shows api client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds list endpoint query via createAdminShowsApiClient", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: { items: [] } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createAdminShowsApiClient({
      baseUrl: "http://example.test",
    });

    await client.listAdminShowEvents({
      query: "beagle",
      page: 2,
      pageSize: 10,
      sort: "date-asc",
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(
      "http://example.test/api/admin/shows?query=beagle&page=2&pageSize=10&sort=date-asc",
    );
    expect(init?.method).toBe("GET");
  });

  it("builds detail endpoint via createAdminShowsApiClient", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: { show: {} } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createAdminShowsApiClient({
      baseUrl: "http://example.test",
    });

    await client.getAdminShowEvent({ showId: "show-1" });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("http://example.test/api/admin/shows/show-1");
    expect(init?.method).toBe("GET");
  });
});
