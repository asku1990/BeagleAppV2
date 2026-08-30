import { describe, expect, it, vi } from "vitest";
import { getBestDriverRanking } from "../get-best-driver-ranking";

describe("getBestDriverRanking", () => {
  it("calls the competition endpoint with the optional season", async () => {
    const requestMock = vi.fn().mockResolvedValue({ ok: true, data: {} });

    await getBestDriverRanking(requestMock, { season: 2025 });

    expect(requestMock).toHaveBeenCalledWith(
      "/api/beagle/competitions/best-driver?season=2025",
      { method: "GET" },
    );
  });
});
