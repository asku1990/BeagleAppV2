import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getBestDriverRankingMock } = vi.hoisted(() => ({
  getBestDriverRankingMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  competitionsService: {
    getBestDriverRanking: getBestDriverRankingMock,
  },
}));

describe("public best-driver api route", () => {
  beforeEach(() => {
    getBestDriverRankingMock.mockReset();
  });

  it("passes a valid season to the service", async () => {
    getBestDriverRankingMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: { season: 2025, availableSeasons: [], items: [] },
      },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/beagle/competitions/best-driver?season=2025",
      { headers: { origin: "http://localhost:3000", "x-request-id": "req-1" } },
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(getBestDriverRankingMock).toHaveBeenCalledWith(
      { season: 2025 },
      { requestId: "req-1" },
    );
  });

  it("passes invalid season input through for service validation", async () => {
    getBestDriverRankingMock.mockResolvedValue({
      status: 400,
      body: { ok: false, error: "Invalid season value." },
    });

    const { GET } = await import("../route");
    const response = await GET(
      new NextRequest(
        "http://localhost/api/beagle/competitions/best-driver?season=2025x",
      ),
    );

    expect(response.status).toBe(400);
    expect(getBestDriverRankingMock).toHaveBeenCalledWith(
      { season: Number.NaN },
      { requestId: undefined },
    );
  });

  it("returns the CORS preflight response", async () => {
    const { OPTIONS } = await import("../route");
    const response = await OPTIONS(
      new NextRequest("http://localhost/api/beagle/competitions/best-driver", {
        method: "OPTIONS",
        headers: { origin: "http://localhost:3000" },
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
      "GET,OPTIONS",
    );
  });
});
