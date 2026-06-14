import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { searchVirtualPairingDogsMock } = vi.hoisted(() => ({
  searchVirtualPairingDogsMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  searchVirtualPairingDogs: searchVirtualPairingDogsMock,
}));

describe("public virtual pairing api route", () => {
  beforeEach(() => {
    searchVirtualPairingDogsMock.mockReset();
  });

  it("returns search results for public clients", async () => {
    searchVirtualPairingDogsMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          field: "name",
          query: "Kide",
          total: 1,
          totalPages: 1,
          page: 2,
          isLimited: false,
          candidateLimit: null,
          items: [],
        },
      },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/beagle/dogs/virtual-pairing?field=name&query=Kide&page=2&pageSize=10",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(searchVirtualPairingDogsMock).toHaveBeenCalledWith({
      field: "name",
      query: "Kide",
      page: 2,
      pageSize: 10,
    });
  });

  it("returns structured errors when the service throws", async () => {
    searchVirtualPairingDogsMock.mockRejectedValue(new Error("boom"));

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/beagle/dogs/virtual-pairing?field=name&query=Kide",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Failed to load virtual pairing search results.",
      code: "INTERNAL_ERROR",
    });
  });
});
