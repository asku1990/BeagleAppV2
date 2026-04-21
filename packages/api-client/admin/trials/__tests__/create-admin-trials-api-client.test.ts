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
      year: 2026,
      dateFrom: "2026-01-01",
      dateTo: "2026-12-31",
      page: 2,
      pageSize: 10,
      sort: "date-asc",
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(
      "http://example.test/api/admin/trials?query=beagle&year=2026&dateFrom=2026-01-01&dateTo=2026-12-31&page=2&pageSize=10&sort=date-asc",
    );
    expect(init?.method).toBe("GET");
  });

  it("builds event detail endpoint path via createAdminTrialsApiClient", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: { event: null } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createAdminTrialsApiClient({
      baseUrl: "http://example.test",
    });

    await client.getAdminTrialEvent({
      trialEventId: "event/1",
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("http://example.test/api/admin/trials/events/event%2F1");
    expect(init?.method).toBe("GET");
  });
});
