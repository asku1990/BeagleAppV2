import { describe, expect, it, vi } from "vitest";
import { searchPublicVirtualPairing } from "../search-public-virtual-pairing";

describe("searchPublicVirtualPairing", () => {
  it("calls request with expected path and method", async () => {
    const requestMock = vi.fn().mockResolvedValue({ ok: true, data: {} });

    await searchPublicVirtualPairing(requestMock, {
      field: "name",
      query: "Kide",
      page: 2,
      pageSize: 10,
    });

    expect(requestMock).toHaveBeenCalledWith(
      "/api/beagle/dogs/virtual-pairing?field=name&query=Kide&page=2&pageSize=10",
      { method: "GET" },
    );
  });

  it("omits optional pagination when not provided", async () => {
    const requestMock = vi.fn().mockResolvedValue({ ok: true, data: {} });

    await searchPublicVirtualPairing(requestMock, {
      field: "reg",
      query: "FI12345/21",
    });

    expect(requestMock).toHaveBeenCalledWith(
      "/api/beagle/dogs/virtual-pairing?field=reg&query=FI12345%2F21",
      { method: "GET" },
    );
  });
});
