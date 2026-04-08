import { describe, expect, it, vi } from "vitest";
import { getAdminShowEvent } from "../get-admin-show-event";
import { listAdminShowEvents } from "../list-admin-show-events";

describe("admin show api helpers", () => {
  it("calls the list endpoint with query params", async () => {
    const requestMock = vi.fn().mockResolvedValue({ ok: true, data: {} });

    await listAdminShowEvents(requestMock, {
      query: "beagle",
      page: 2,
      pageSize: 10,
      sort: "date-desc",
    });

    expect(requestMock).toHaveBeenCalledWith(
      "/api/admin/shows?query=beagle&page=2&pageSize=10&sort=date-desc",
      { method: "GET" },
    );
  });

  it("calls the detail endpoint with encoded show id", async () => {
    const requestMock = vi.fn().mockResolvedValue({ ok: true, data: {} });

    await getAdminShowEvent(requestMock, {
      showId: "show id/1",
    });

    expect(requestMock).toHaveBeenCalledWith("/api/admin/shows/show%20id%2F1", {
      method: "GET",
    });
  });
});
