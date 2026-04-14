import { afterEach, describe, expect, it, vi } from "vitest";
import { createAdminTrialsApiClient } from "../create-admin-trials-api-client";

describe("admin trials api client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds list endpoint query via createAdminTrialsApiClient", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: { items: [] } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createAdminTrialsApiClient({
      baseUrl: "http://example.test",
    });

    await client.listAdminTrials({
      query: "beagle",
      page: 2,
      pageSize: 10,
      sort: "date-asc",
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(
      "http://example.test/api/admin/trials?query=beagle&page=2&pageSize=10&sort=date-asc",
    );
    expect(init?.method).toBe("GET");
  });
});
