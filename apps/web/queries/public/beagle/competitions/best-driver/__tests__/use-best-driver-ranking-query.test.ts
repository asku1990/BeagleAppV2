import { beforeEach, describe, expect, it, vi } from "vitest";

const { useQueryMock, getBestDriverRankingMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getBestDriverRankingMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@beagle/api-client", () => ({
  createPublicCompetitionsApiClient: () => ({
    getBestDriverRanking: getBestDriverRankingMock,
  }),
}));

import { bestDriverRankingQueryKey } from "../query-key";
import { useBestDriverRankingQuery } from "../use-best-driver-ranking-query";

describe("useBestDriverRankingQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getBestDriverRankingMock.mockReset();
  });

  it("configures the query with the season key", () => {
    useQueryMock.mockImplementation((options) => options);

    useBestDriverRankingQuery({ season: 2025 });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: unknown[];
      staleTime: number;
    };
    expect(options.queryKey).toEqual(
      bestDriverRankingQueryKey({ season: 2025 }),
    );
    expect(options.staleTime).toBe(5 * 60 * 1000);
  });

  it("returns successful ranking data", async () => {
    useQueryMock.mockImplementation((options) => options);
    const data = { season: 2025, availableSeasons: [2025], items: [] };
    getBestDriverRankingMock.mockResolvedValue({ ok: true, data });

    useBestDriverRankingQuery({ season: 2025 });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual(data);
    expect(getBestDriverRankingMock).toHaveBeenCalledWith({ season: 2025 });
  });

  it("throws the API error", async () => {
    useQueryMock.mockImplementation((options) => options);
    getBestDriverRankingMock.mockResolvedValue({
      ok: false,
      error: "Invalid season value.",
    });

    useBestDriverRankingQuery({ season: 2025 });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow("Invalid season value.");
  });
});
